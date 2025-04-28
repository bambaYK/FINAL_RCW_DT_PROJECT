from django.urls import path
from .views import (
    LibraryListCreateView,
    LibraryDetailView,
    EmpruntView,
    PDFView,
    BorrowedBooksView,
    #BorrowHistoryView,
    ReturnBookView,
    SubscriptionCreateView,
    SubscriptionStatusView,
    ChatBotView
)

#from .views import CreateStripeSubscriptionView, StripeWebhookView

urlpatterns = [
    path('library/', LibraryListCreateView.as_view(), name='library-list-create'),
    path('library/<uuid:pk>/', LibraryDetailView.as_view(), name='library-detail'),
    path('library/<uuid:pk>/borrow/', EmpruntView.as_view(), name='library-borrow'),
    path('library/<uuid:pk>/pdf/', PDFView.as_view(), name='library-pdf'),
    path('library/borrowed/', BorrowedBooksView.as_view(), name='library-borrowed'),
    #path('library/history/', BorrowHistoryView.as_view(), name='library-history'),
    path('library/return/<uuid:pk>/', ReturnBookView.as_view(), name='library-return'),
    path('subscriptions/', SubscriptionCreateView.as_view(), name='subscription-create'),
    path('subscriptions/status/', SubscriptionStatusView.as_view(), name='subscription-status'),
    path('chatbot/', ChatBotView.as_view(), name='chatbot'),
    # path('create-subscription/', CreateStripeSubscriptionView.as_view(), name='create-subscription'),
    # path('stripe/webhook/', StripeWebhookView.as_view(), name='stripe-webhook'),
]


# urls.py
from .views import CreatePayPalSubscriptionView

urlpatterns += [
    path('paypal/create-subscription/', CreatePayPalSubscriptionView.as_view(), name='paypal-create-subscription'),
]

# urls.py
from .views import PayPalWebhookView

urlpatterns += [
    path('paypal/webhook/', PayPalWebhookView.as_view(), name='paypal-webhook'),
]


from .views import cancel_subscription

urlpatterns += [
    path('subscriptions/cancel/', cancel_subscription, name='subscription-cancel'),
]


from .views import BorrowAndSubscriptionHistoryView

urlpatterns += [
    path('library/full-history/', BorrowAndSubscriptionHistoryView.as_view(), name='borrow-subscription-history'),
]

