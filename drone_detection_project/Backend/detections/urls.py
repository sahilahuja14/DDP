from django.urls import path

from . import views


urlpatterns = [
    path("detect/", views.DetectView.as_view(), name="detect"),
    path("detections/", views.DetectionListView.as_view(), name="detection-list"),
    path("detections/<int:pk>/", views.DetectionDetailView.as_view(), name="detection-detail"),
    path("detections/<int:pk>/report.json", views.DetectionReportJSONView.as_view(), name="detection-report-json"),
    path("detections/<int:pk>/report.pdf", views.detection_report_pdf, name="detection-report-pdf"),
    path("analytics/summary/", views.AnalyticsSummaryView.as_view(), name="analytics-summary"),
    path("training/start/", views.start_fake_training, name="training-start"),
    path("training/logs/", views.TrainingLogsView.as_view(), name="training-logs"),
]

