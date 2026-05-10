from django.urls import path
from .views import GenerateSerialsView, VerifySerialAPIView,GenerateBatchAPIView,FullHierarchyAPIView,ProductListAPIView,DashboardStatsAPIView,ScanLogListAPIView,UpdateSerialStatusAPIView,BulkHierarchyStatusAPIView
urlpatterns = [
    path('generate-serials/', GenerateSerialsView.as_view(), name='generate-serials'),
    path('verify-serial/', VerifySerialAPIView.as_view(), name='verify-serial'),
    path('generate-batch/', GenerateBatchAPIView.as_view(), name='generate-batch'),
    path('full-hierarchy/<str:serial>/', FullHierarchyAPIView.as_view(), name='full-hierarchy'),
    path("products/",ProductListAPIView.as_view(),name="products"),
    path("stats/",DashboardStatsAPIView.as_view(),name="stats"),
    path("scan-logs/", ScanLogListAPIView.as_view(),name="scan-logs"),
    path(
    "update-status/",
    UpdateSerialStatusAPIView.as_view(),
    name="update-status"
),

path(
    "bulk-update-status/",
    BulkHierarchyStatusAPIView.as_view(),
    name="bulk-update-status"
),
]