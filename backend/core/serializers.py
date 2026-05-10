from rest_framework import serializers
from .models import SerialNumber,Product,ScanLog
class SerialNumberSerializer(serializers.ModelSerializer):
    class Meta:
        model = SerialNumber
        fields = ['id', 'serial','level','check_digit','created_at']
class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model=Product
        fields=['id','name','product_code']
class ScanLogSerializer(serializers.ModelSerializer):
    serial = serializers.CharField(source="serial.serial")

    class Meta:
        model = ScanLog
        fields = ["serial", "location", "scanned_at"]