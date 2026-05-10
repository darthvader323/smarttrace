from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListAPIView

from django.shortcuts import get_object_or_404
from django.db.models import Count
from .models import Product,SerialNumber,ScanLog,PackageHierarchy
from.utils import generate_serials,generate_hash,generate_batch
from .serializers import SerialNumberSerializer,ProductSerializer,ScanLogSerializer
from datetime import timedelta
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
# Create your views here.
class GenerateSerialsView(APIView):
    def post(self,request):
        product_id=request.data.get('product_id')
        level=request.data.get('level')
        quantity=int(request.data.get('quantity',0))
        if not all([product_id,level,quantity]):
            return Response({"error":"product_id,level,quantity are required"},status=status.HTTP_400_BAD_REQUEST)
        product=get_object_or_404(Product,id=product_id)
        serials=generate_serials(product,level,quantity)
        serializer=SerialNumberSerializer(serials,many=True)
        return Response(serializer.data,status=status.HTTP_201_CREATED)
    
class VerifySerialAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request):
        serial_input=request.data.get('serial')
        location=request.data.get('location','')
        try:
            serial_obj=SerialNumber.objects.get(serial=serial_input)
        except SerialNumber.DoesNotExist:
            return Response({"status":"INVALID"},status=400)
        expected_hash=generate_hash(serial_obj.serial,serial_obj.product.product_code)
        if expected_hash != serial_obj.hash_value:
            return Response({"status":"INVALID"},status=400)
        

        status_result = "VALID"
        # 🚨 Product status check
        if serial_obj.status == "RECALLED":
            return Response({
        "status": "RECALLED",
        "message": "Product has been recalled"
    })

        if serial_obj.status == "EXPIRED":
            return Response({
        "status": "EXPIRED",
        "message": "Product is expired"
    })
        last_scan = serial_obj.scans.order_by('-scanned_at').first()
        current_time = timezone.now()
        if last_scan:
            time_diff = current_time - last_scan.scanned_at

            if last_scan.location != location and time_diff < timedelta(minutes=30):
                status_result = "SUSPECT"   # suspicious movement
            elif time_diff < timedelta(minutes=5):
                status_result = "SUSPECT"   # too frequent scan
            else:
                status_result = "VALID"     # normal re-scan

        # Save scan AFTER decision
        ScanLog.objects.create(
    user=request.user,
    serial=serial_obj,
    location=location
)

        return Response({"status": status_result})
class GenerateBatchAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        if request.user.userprofile.role != "ADMIN":
            return Response({"error": "Permission denied"}, status=403)
        product_id = request.data.get("product_id")
        total_units = int(request.data.get("total_units"))
        units_per_carton = int(request.data.get("units_per_carton"))
        cartons_per_pallet = int(request.data.get("cartons_per_pallet"))

        product = get_object_or_404(Product, id=product_id)

        result = generate_batch(
            product,
            total_units,
            units_per_carton,
            cartons_per_pallet
        )

        return Response({
            "message": "Batch generated successfully",
            "summary": result
        })     
# Recursive function to build complete tree
def build_tree(serial_obj):

    children_links = PackageHierarchy.objects.filter(
        parent=serial_obj
    )

    children = []

    for link in children_links:

        child = link.child

        children.append({
            "serial": child.serial,
            "level": child.level,
            "children": build_tree(child)
        })

    return children


class FullHierarchyAPIView(APIView):

    def get(self, request, serial):

        try:

            # Serial entered by user
            current = SerialNumber.objects.get(
                serial=serial
            )

        except SerialNumber.DoesNotExist:

            return Response(
                {"error": "Serial not found"},
                status=404
            )

        # Move upward to find root
        while True:

            parent_link = PackageHierarchy.objects.filter(
                child=current
            ).first()

            if not parent_link:
                break

            current = parent_link.parent

        # current is now top-most parent/root

        tree = {
            "serial": current.serial,
            "level": current.level,
            "children": build_tree(current)
        }

        return Response(tree)
class ProductListAPIView(ListAPIView):
    queryset=Product.objects.all()
    serializer_class=ProductSerializer
    permission_classes =[IsAuthenticated]
class DashboardStatsAPIView(APIView):

    def get(self, request):

        total_products = Product.objects.count()
        total_serials = SerialNumber.objects.count()
        total_scans = ScanLog.objects.count()

        # Suspect = scanned more than once
        suspect_serials = SerialNumber.objects.annotate(
            scan_count=Count("scans")
        ).filter(scan_count__gt=1).count()

        return Response({
            "total_products": total_products,
            "total_serials": total_serials,
            "total_scans": total_scans,
            "suspect_serials": suspect_serials
        })
class ScanLogListAPIView(ListAPIView):

    serializer_class = ScanLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        # Admin sees all logs
        if user.userprofile.role == "ADMIN":

            return ScanLog.objects.all().order_by(
                '-scanned_at'
            )

        # Scanner sees only their own logs
        return ScanLog.objects.filter(
            user=user
        ).order_by('-scanned_at')

class UpdateSerialStatusAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serial = request.data.get("serial")
        status_value = request.data.get("status")

        VALID_STATUSES = [
            "ACTIVE",
            "EXPIRED",
            "RECALLED"
        ]

        # Validation
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

        # Update entered serial
        serial_obj.status = status_value
        serial_obj.save()

        return Response({
            "message": f"{serial} marked as {status_value}"
        })


# -----------------------------------------
# BULK RECALL / STATUS UPDATE
# Updates entire hierarchy downward
# -----------------------------------------

def update_children_status(serial_obj, status_value):

    children_links = PackageHierarchy.objects.filter(
        parent=serial_obj
    )

    for link in children_links:

        child = link.child

        child.status = status_value
        child.save()

        # Recursive update
        update_children_status(child, status_value)


class BulkHierarchyStatusAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serial = request.data.get("serial")
        status_value = request.data.get("status")

        VALID_STATUSES = [
            "ACTIVE",
            "EXPIRED",
            "RECALLED"
        ]

        # Validation
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

        # Update root
        root.status = status_value
        root.save()

        # Update all descendants
        update_children_status(root, status_value)

        return Response({
            "message":
            f"{serial} and all child items marked as {status_value}"
        })
