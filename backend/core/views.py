from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListAPIView
from django.shortcuts import get_object_or_404
from django.db.models import Count
from datetime import timedelta
from django.utils import timezone

from rest_framework.permissions import (
    IsAuthenticated,
    BasePermission
)

from .models import (
    Product,
    SerialNumber,
    ScanLog,
    PackageHierarchy
)

from .utils import (
    generate_serials,
    generate_hash,
    generate_batch,
    validate_check_digit
)

from .serializers import (
    SerialNumberSerializer,
    ProductSerializer,
    ScanLogSerializer
)


# =====================================================
# CUSTOM ADMIN PERMISSION
# =====================================================

class IsAdminUser(BasePermission):

    message = "Admin access required"

    def has_permission(self, request, view):

        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == "ADMIN"
        )


# =====================================================
# GENERATE SERIALS
# =====================================================

class GenerateSerialsView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdminUser
    ]

    def post(self, request):

        product_id = request.data.get("product_id")
        level = request.data.get("level")
        quantity_raw = request.data.get("quantity", 0)

        if not product_id or not level:

            return Response(
                {"error": "product_id and level are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            quantity = int(quantity_raw)

        except (TypeError, ValueError):

            return Response(
                {"error": "quantity must be a valid number"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if quantity <= 0:

            return Response(
                {"error": "quantity must be greater than zero"},
                status=status.HTTP_400_BAD_REQUEST
            )

        product = get_object_or_404(
            Product,
            id=product_id
        )

        serials = generate_serials(
            product,
            level,
            quantity
        )

        serializer = SerialNumberSerializer(
            serials,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


# =====================================================
# VERIFY SERIAL
# =====================================================

class VerifySerialAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serial_input = request.data.get("serial")
        location = request.data.get("location", "")

        def create_scan_log(serial_obj, result):

            ScanLog.objects.create(
                user=request.user,
                serial=serial_obj,
                raw_serial=(
                    serial_obj.serial
                    if serial_obj
                    else serial_input or ""
                ),
                serial_status=(
                    serial_obj.status
                    if serial_obj
                    else ""
                ),
                scan_result=result,
                location=location
            )

        try:

            serial_obj = SerialNumber.objects.get(
                serial=serial_input
            )

        except SerialNumber.DoesNotExist:

            create_scan_log(None, "INVALID")

            return Response(
                {"status": "INVALID"},
                status=400
            )

        if not validate_check_digit(serial_input):

            create_scan_log(serial_obj, "INVALID")

            return Response(
                {
                    "status": "INVALID",
                    "message": "Check digit validation failed"
                },
                status=400
            )

        production_date = serial_obj.created_at.strftime(
            "%Y%m%d"
        )

        expected_hash = generate_hash(
            serial_obj.serial,
            serial_obj.product.product_code,
            production_date
        )

        if expected_hash != serial_obj.hash_value:

            create_scan_log(serial_obj, "INVALID")

            return Response(
                {"status": "INVALID"},
                status=400
            )

        status_result = "VALID"

        # Product recalled
        if serial_obj.status == "RECALLED":

            create_scan_log(serial_obj, "VALID")

            return Response({
                "status": "RECALLED",
                "message": "Product has been recalled"
            })

        # Product expired
        if serial_obj.status == "EXPIRED":

            create_scan_log(serial_obj, "VALID")

            return Response({
                "status": "EXPIRED",
                "message": "Product is expired"
            })

        last_scan = serial_obj.scans.order_by(
            '-scanned_at'
        ).first()

        current_time = timezone.now()

        if last_scan:

            time_diff = (
                current_time - last_scan.scanned_at
            )

            if (
                last_scan.location != location and
                time_diff < timedelta(minutes=30)
            ):

                status_result = "SUSPECT"

            elif time_diff < timedelta(minutes=5):

                status_result = "SUSPECT"

            else:

                status_result = "VALID"

        create_scan_log(
            serial_obj,
            status_result
        )

        return Response({
            "status": status_result,
            "serial": serial_obj.serial,
            "product": serial_obj.product.name,
            "level": serial_obj.level,
            "verification_code":
            serial_obj.hash_value[:8]
        })


# =====================================================
# CHECK DIGIT VALIDATION
# =====================================================

class CheckDigitValidationAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serial = request.data.get("serial", "")

        if not serial:

            return Response(
                {"error": "Please provide serial"},
                status=status.HTTP_400_BAD_REQUEST
            )

        is_valid = validate_check_digit(serial)

        return Response({
            "valid": is_valid
        })


# =====================================================
# HIERARCHY VERIFICATION
# =====================================================

class HierarchyVerificationAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        primary_serial = request.data.get(
            "primary_serial"
        )

        claimed_secondary = request.data.get(
            "secondary_serial"
        )

        if not primary_serial or not claimed_secondary:

            return Response(
                {
                    "error":
                    "primary_serial and secondary_serial are required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            primary = SerialNumber.objects.get(
                serial=primary_serial
            )

            secondary = SerialNumber.objects.get(
                serial=claimed_secondary
            )

        except SerialNumber.DoesNotExist:

            return Response(
                {"error": "Serial not found"},
                status=404
            )

        current = primary

        while True:

            parent_link = PackageHierarchy.objects.filter(
                child=current
            ).first()

            if not parent_link:
                break

            if parent_link.parent == secondary:

                return Response({"valid": True})

            current = parent_link.parent

        return Response({"valid": False})


# =====================================================
# GENERATE BATCH
# =====================================================

class GenerateBatchAPIView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdminUser
    ]

    def post(self, request):

        product_id = request.data.get("product_id")

        total_units_raw = request.data.get(
            "total_units"
        )

        units_per_carton_raw = request.data.get(
            "units_per_carton"
        )

        cartons_per_pallet_raw = request.data.get(
            "cartons_per_pallet"
        )

        if not product_id:

            return Response(
                {"error": "product_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            total_units = int(total_units_raw)

            units_per_carton = int(
                units_per_carton_raw
            )

            cartons_per_pallet = int(
                cartons_per_pallet_raw
            )

        except (TypeError, ValueError):

            return Response(
                {
                    "error":
                    "All quantities must be valid numbers"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if (
            total_units <= 0 or
            units_per_carton <= 0 or
            cartons_per_pallet <= 0
        ):

            return Response(
                {
                    "error":
                    "All quantities must be greater than zero"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        product = get_object_or_404(
            Product,
            id=product_id
        )

        result = generate_batch(
            product,
            total_units,
            units_per_carton,
            cartons_per_pallet
        )

        return Response({
            "message":
            "Batch generated successfully",
            "summary": result
        })


# =====================================================
# RECURSIVE TREE BUILDER
# =====================================================

def build_tree(serial_obj, visited=None):

    if visited is None:
        visited = set()

    if serial_obj.id in visited:
        return []

    visited.add(serial_obj.id)

    children_links = PackageHierarchy.objects.filter(
        parent=serial_obj
    )

    children = []

    for link in children_links:

        child = link.child

        children.append({
            "serial": child.serial,
            "level": child.level,
            "children": build_tree(
                child,
                visited
            )
        })

    return children


# =====================================================
# FULL HIERARCHY VIEW
# =====================================================

class FullHierarchyAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, serial):

        try:

            current = SerialNumber.objects.get(
                serial=serial
            )

        except SerialNumber.DoesNotExist:

            return Response(
                {"error": "Serial not found"},
                status=404
            )

        original_serial = current

        # Move to root
        while True:

            parent_link = PackageHierarchy.objects.filter(
                child=current
            ).first()

            if not parent_link:
                break

            current = parent_link.parent

        tree = {
            "serial": current.serial,
            "level": current.level,
            "children": build_tree(current)
        }

        trace_path = []

        current_path = original_serial

        while current_path:

            trace_path.append({
                "serial": current_path.serial,
                "level": current_path.level
            })

            parent_link = PackageHierarchy.objects.filter(
                child=current_path
            ).first()

            if not parent_link:
                break

            current_path = parent_link.parent

        trace_path.reverse()

        return Response({
            "tree": tree,
            "trace_path": trace_path
        })


# =====================================================
# PRODUCT LIST
# =====================================================

class ProductListAPIView(ListAPIView):

    queryset = Product.objects.all()

    serializer_class = ProductSerializer

    permission_classes = [IsAuthenticated]


# =====================================================
# SERIAL LIST
# =====================================================

class SerialListAPIView(ListAPIView):

    serializer_class = SerialNumberSerializer

    permission_classes = [
        IsAuthenticated,
        IsAdminUser
    ]

    def get_queryset(self):

        queryset = SerialNumber.objects.all().order_by(
            '-created_at'
        )

        status_filter = self.request.query_params.get(
            "status",
            ""
        )

        if status_filter in [
            "ACTIVE",
            "EXPIRED",
            "RECALLED"
        ]:

            queryset = queryset.filter(
                status=status_filter
            )

        search = self.request.query_params.get(
            "search",
            ""
        ).strip()

        if search:

            queryset = queryset.filter(
                serial__icontains=search
            )

        return queryset


# =====================================================
# DASHBOARD STATS
# =====================================================

class DashboardStatsAPIView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdminUser
    ]

    def get(self, request):

        total_products = Product.objects.count()

        total_serials = SerialNumber.objects.count()

        total_scans = ScanLog.objects.count()

        suspect_serials = ScanLog.objects.filter(
            scan_result="SUSPECT"
        ).count()

        status_counts = {
            item["status"]: item["total"]
            for item in SerialNumber.objects.values(
                "status"
            ).annotate(
                total=Count("id")
            )
        }

        location_hotspots = list(
            ScanLog.objects.exclude(location="")
            .values("location")
            .annotate(total=Count("id"))
            .order_by("-total")[:5]
        )

        recent_suspicious_events = []

        for log in ScanLog.objects.filter(
            scan_result__in=[
                "SUSPECT",
                "INVALID"
            ]
        ).order_by("-scanned_at")[:5]:

            recent_suspicious_events.append({
                "serial":
                log.raw_serial or (
                    log.serial.serial
                    if log.serial
                    else ""
                ),

                "serial_status":
                log.serial_status or (
                    log.serial.status
                    if log.serial
                    else ""
                ),

                "scan_result":
                log.scan_result,

                "location":
                log.location,

                "scanned_at":
                log.scanned_at
            })

        return Response({
            "total_products": total_products,
            "total_serials": total_serials,
            "total_scans": total_scans,
            "suspect_serials": suspect_serials,

            "status_distribution": {
                "ACTIVE":
                status_counts.get("ACTIVE", 0),

                "EXPIRED":
                status_counts.get("EXPIRED", 0),

                "RECALLED":
                status_counts.get("RECALLED", 0)
            },

            "location_hotspots":
            location_hotspots,

            "recent_suspicious_events":
            recent_suspicious_events
        })


# =====================================================
# SCAN LOG LIST
# =====================================================

class ScanLogListAPIView(ListAPIView):

    serializer_class = ScanLogSerializer

    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        # Admin sees everything
        if user.role == "ADMIN":

            return ScanLog.objects.all().order_by(
                '-scanned_at'
            )

        # Scanner sees only own scans
        return ScanLog.objects.filter(
            user=user
        ).order_by('-scanned_at')


# =====================================================
# UPDATE SINGLE SERIAL STATUS
# =====================================================

class UpdateSerialStatusAPIView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdminUser
    ]

    def post(self, request):

        serial = request.data.get("serial")

        status_value = request.data.get("status")

        VALID_STATUSES = [
            "ACTIVE",
            "EXPIRED",
            "RECALLED"
        ]

        if not serial:

            return Response(
                {"error": "Please provide serial"},
                status=400
            )

        if not status_value:

            return Response(
                {"error": "Please provide status"},
                status=400
            )

        if status_value not in VALID_STATUSES:

            return Response(
                {"error": "Invalid status"},
                status=400
            )

        try:

            serial_obj = SerialNumber.objects.get(
                serial=serial
            )

        except SerialNumber.DoesNotExist:

            return Response(
                {"error": "Serial not found"},
                status=404
            )

        serial_obj.status = status_value
        serial_obj.save()

        return Response({
            "message":
            f"{serial} marked as {status_value}"
        })


# =====================================================
# RECURSIVE CHILD STATUS UPDATE
# =====================================================

def update_children_status(
    serial_obj,
    status_value,
    visited=None
):

    if visited is None:
        visited = set()

    if serial_obj.id in visited:
        return

    visited.add(serial_obj.id)

    children_links = PackageHierarchy.objects.filter(
        parent=serial_obj
    )

    for link in children_links:

        child = link.child

        child.status = status_value
        child.save()

        update_children_status(
            child,
            status_value,
            visited
        )


# =====================================================
# BULK STATUS UPDATE
# =====================================================

class BulkHierarchyStatusAPIView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdminUser
    ]

    def post(self, request):

        serial = request.data.get("serial")

        status_value = request.data.get("status")

        VALID_STATUSES = [
            "ACTIVE",
            "EXPIRED",
            "RECALLED"
        ]

        if not serial:

            return Response(
                {"error": "Please provide serial"},
                status=400
            )

        if not status_value:

            return Response(
                {"error": "Please provide status"},
                status=400
            )

        if status_value not in VALID_STATUSES:

            return Response(
                {"error": "Invalid status"},
                status=400
            )

        try:

            root = SerialNumber.objects.get(
                serial=serial
            )

        except SerialNumber.DoesNotExist:

            return Response(
                {"error": "Serial not found"},
                status=404
            )

        root.status = status_value
        root.save()

        update_children_status(
            root,
            status_value
        )

        return Response({
            "message":
            f"{serial} and all child items marked as {status_value}"
        })