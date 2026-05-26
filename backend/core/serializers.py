from rest_framework import serializers
from .models import SerialNumber,Product,ScanLog
class SerialNumberSerializer(serializers.ModelSerializer):
    product_name = serializers.SerializerMethodField()
    verification_code = serializers.SerializerMethodField()

    def get_product_name(self, obj):
        return obj.product.name if obj.product else ""

    def get_verification_code(self, obj):
        if obj.hash_value:
            return obj.hash_value[:8]
        return ""

    class Meta:
        model = SerialNumber
        fields = [
            'id',
            'serial',
            'product_name',
            'level',
            'check_digit',
            'verification_code',
            'status',
            'created_at'
        ]
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model=Product
        fields=['id','name','product_code']
class ScanLogSerializer(serializers.ModelSerializer):
    serial = serializers.SerializerMethodField()
    serial_status = serializers.SerializerMethodField()

    def get_serial(self, obj):
        if obj.serial:
            return obj.serial.serial
        return obj.raw_serial

    def get_serial_status(self, obj):
        if obj.serial_status:
            return obj.serial_status
        if obj.serial:
            return obj.serial.status
        return ""

    class Meta:
        model = ScanLog
        fields = [
            "serial",
            "serial_status",
            "scan_result",
            "location",
            "scanned_at"
        ]
