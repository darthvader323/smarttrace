from django.contrib import admin
from .models import Product, SerialNumber, PackageHierarchy,ScanLog

# Register your models here.
admin.site.register(Product)
admin.site.register(SerialNumber)  
admin.site.register(PackageHierarchy)
admin.site.register(ScanLog)
