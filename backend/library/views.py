from django.http import FileResponse, Http404, HttpResponse
from users.models import CustomUser
from django.utils.text import slugify
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from datetime import datetime, timedelta
import os
from .models import Library, Emprunt, Subscription
from .serializers import LibrarySerializer, EmpruntSerializer, SubscriptionSerializer
from .chatbot_engine import ask_chatbot
import requests

import stripe
from django.conf import settings
#from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
#from rest_framework.response import Response
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .models import StripeCustomer
#from datetime import timedelta
from django.utils import timezone


# stripe.api_key = settings.STRIPE_SECRET_KEY

# # Mapping des types d'abonnement vers les price_id de Stripe
# STRIPE_PRICE_IDS = {
#     "15_days": "price_1R6bsBQOjHK1QTtCrSJx8XTB",
#     "1_month": "price_1R6buAQOjHK1QTtChuKkXucu",
#     "1_year": "price_1R6bvBQOjHK1QTtCyn6ayWp1"
# }


class LibraryListCreateView(generics.ListCreateAPIView):
    serializer_class = LibrarySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Library.objects.all()
        type = self.request.query_params.get('type', None)
        if type is not None:
            queryset = queryset.filter(type=type)
        return queryset

class LibraryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Library.objects.all()
    serializer_class = LibrarySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class EmpruntView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            # Check for active subscription
            active_subscription = Subscription.objects.filter(
                user=request.user,
                status='active',
                end_date__gt=datetime.now()
            ).exists()

            if not active_subscription:
                return Response(
                    {"detail": "Un abonnement actif est requis pour emprunter"},
                    status=status.HTTP_403_FORBIDDEN
                )

            resource = Library.objects.get(pk=pk)
            
            # Check if already borrowed
            if Emprunt.objects.filter(
                user=request.user,
                resource=resource,
                est_retourne=False
            ).exists():
                return Response(
                    {"detail": "Vous avez déjà emprunté cette ressource"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check active borrows count
            emprunts_actifs = Emprunt.objects.filter(
                user=request.user,
                est_retourne=False
            ).count()
            
            if emprunts_actifs >= 5:
                return Response(
                    {"detail": "Vous avez atteint le nombre maximum d'emprunts simultanés (5)"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get borrow duration
            duration = request.data.get('duration', 7)  # Default 7 days
            if duration not in [7, 14, 30]:
                duration = 7
            
            # Create borrow
            date_retour = datetime.now() + timedelta(days=duration)
            emprunt = Emprunt.objects.create(
                user=request.user,
                resource=resource,
                date_retour=date_retour
            )
            
            return Response(
                EmpruntSerializer(emprunt).data,
                status=status.HTTP_201_CREATED
            )
            
        except Library.DoesNotExist:
            raise Http404

class PDFView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            # Check for active subscription
            active_subscription = Subscription.objects.filter(
                user=request.user,
                status='active',
                end_date__gt=datetime.now()
            ).exists()

            if not active_subscription:
                return Response(
                    {"detail": "Un abonnement actif est requis pour accéder aux documents"},
                    status=status.HTTP_403_FORBIDDEN
                )

            resource = Library.objects.get(pk=pk)
            
            # Check if borrowed
            emprunt = Emprunt.objects.filter(
                user=request.user,
                resource=resource,
                est_retourne=False
            ).first()
            
            if not emprunt:
                return Response(
                    {"detail": "Vous devez d'abord emprunter cette ressource"},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get PDF file
            pdf_path = resource.get_pdf_path()
            if not os.path.exists(pdf_path):
                # Create sample PDF if it doesn't exist
                from library.utils import create_sample_pdf
                content = f"""
                Titre: {resource.titre}
                Auteur: {resource.auteur}
                Description: {resource.description}
                
                Ceci est un exemple de contenu PDF pour {resource.titre}.
                """
                create_sample_pdf(
                    resource.titre,
                    resource.auteur,
                    content,
                    pdf_path
                )
            
            # Open and read PDF file
            with open(pdf_path, 'rb') as pdf:
                response = HttpResponse(pdf.read(), content_type='application/pdf')
                response['Content-Disposition'] = f'inline; filename="{slugify(resource.titre)}.pdf"'
                # Allow embedding in iframes
                response['X-Frame-Options'] = 'SAMEORIGIN'
                # Add CORS headers
                response['Access-Control-Allow-Origin'] = '*'
                response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
                response['Access-Control-Allow-Headers'] = 'Authorization, Content-Type'
                return response
            
        except Library.DoesNotExist:
            raise Http404
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class BorrowedBooksView(generics.ListAPIView):
    serializer_class = EmpruntSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Emprunt.objects.filter(
            user=self.request.user,
            est_retourne=False
        ).select_related('resource').order_by('-date_emprunt')

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Emprunt, Subscription
from .serializers import EmpruntSerializer, SubscriptionSerializer
from django.utils import timezone

class BorrowAndSubscriptionHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        emprunts = Emprunt.objects.filter(
            user=user,
            est_retourne=True
        ).select_related('resource').order_by('-date_emprunt')

        abonnements = Subscription.objects.filter(
            user=user,
            end_date__lt=timezone.now()
        ).order_by('-start_date')

        return Response({
            "emprunts": EmpruntSerializer(emprunts, many=True).data,
            "subscriptions": SubscriptionSerializer(abonnements, many=True).data
        })


class ReturnBookView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            emprunt = Emprunt.objects.get(
                pk=pk,
                user=request.user,
                est_retourne=False
            )
            emprunt.est_retourne = True
            emprunt.save()
            
            return Response(
                {"detail": "Livre retourné avec succès"},
                status=status.HTTP_200_OK
            )
        except Emprunt.DoesNotExist:
            raise Http404

class SubscriptionCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            # Check if user already has an active subscription
            active_subscription = Subscription.objects.filter(
                user=request.user,
                status='active',
                end_date__gt=datetime.now()
            ).first()

            if active_subscription:
                return Response(
                    {"detail": "Vous avez déjà un abonnement actif"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create new subscription
            subscription = Subscription.objects.create(
                user=request.user,
                type=request.data.get('type'),
                price=request.data.get('price')
            )

            return Response(
                SubscriptionSerializer(subscription).data,
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class SubscriptionStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        subscription = Subscription.objects.filter(
            user=request.user,
            status='active',
            end_date__gt=datetime.now()
        ).first()

        return Response({
            "is_active": bool(subscription),
            "subscription": SubscriptionSerializer(subscription).data if subscription else None
        })
    

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .chatbot_engine import ask_chatbot

class ChatBotView(APIView):
    def post(self, request):
        question = request.data.get("message", "")
        history = request.data.get("history", [])
        if not question:
            return Response({"error": "Message requis"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            answer = ask_chatbot(question, chat_history=history)
            return Response({"response": answer})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        
class CreatePayPalSubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan_type = request.data.get("plan")
        price_map = {
            "15_days": 9.99,
            "1_month": 19.99,
            "1_year": 199.99,
        }
        if plan_type not in price_map:
            return Response({"error": "Type d'abonnement invalide"}, status=400)

        # Authentifier avec PayPal (client_id + secret)
        auth = (settings.PAYPAL_CLIENT_ID, settings.PAYPAL_SECRET)
        response = requests.post(
            "https://api-m.sandbox.paypal.com/v1/oauth2/token",
            auth=auth,
            data={"grant_type": "client_credentials"}
        )
        access_token = response.json()["access_token"]

        # Créer un lien de paiement
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}",
        }
        body = {
            "intent": "CAPTURE",
            "purchase_units": [{
                "amount": {
                    "currency_code": "EUR",
                    "value": str(price_map[plan_type])
                },
                "custom_id": f"{request.user.id}:{plan_type}"
            }],
            "application_context": {
                "return_url": "http://localhost:5173/success?activated=true",
                "cancel_url": "http://localhost:5173/cancel"
            }

        }
        res = requests.post("https://api-m.sandbox.paypal.com/v2/checkout/orders", json=body, headers=headers)
        paypal_url = next(link["href"] for link in res.json()["links"] if link["rel"] == "approve")

        return Response({"url": paypal_url})

# views.py
from django.utils.timezone import now
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
import json
from datetime import timedelta
from .models import Subscription

@method_decorator(csrf_exempt, name='dispatch')
class PayPalWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            event = json.loads(request.body)
            event_type = event.get("event_type")

            if event_type == "CHECKOUT.ORDER.APPROVED":
                custom_id = event["resource"]["purchase_units"][0]["custom_id"]
                user_id, plan_type = custom_id.split(":")
                user = CustomUser.objects.get(id=user_id)

                # Empêcher toute création si un abonnement actif existe déjà
                if Subscription.objects.filter(
                    user=user,
                    status='active',
                    end_date__gt=now()
                ).exists():
                    print(f"❌ Abonnement déjà actif pour {user.username}, webhook ignoré.")
                    return Response({"detail": "Abonnement déjà actif"}, status=200)

                # Créer un nouvel abonnement
                durations = {"15_days": 15, "1_month": 30, "1_year": 365}
                price_map = {"15_days": 9.99, "1_month": 19.99, "1_year": 199.99}

                Subscription.objects.create(
                    user=user,
                    type=plan_type,
                    price=price_map[plan_type],
                    status="active",
                    start_date=now(),
                    end_date=now() + timedelta(days=durations[plan_type])
                )

                print(f"✅ Paiement validé, abonnement activé pour {user.username}")
                return Response(status=200)

            return Response({"detail": "Type d’événement non géré"}, status=200)

        except Exception as e:
            print("❌ Erreur Webhook PayPal:", str(e))
            return Response({"error": str(e)}, status=400)



from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from .models import Subscription

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_subscription(request):
    try:
        subscription = Subscription.objects.filter(
            user=request.user,
            status='active',
            end_date__gt=timezone.now()
        ).first()

        if not subscription:
            return Response({"detail": "Aucun abonnement actif trouvé."}, status=404)

        subscription.status = 'cancelled'
        subscription.end_date = timezone.now()
        subscription.save()

        return Response({"detail": "Abonnement annulé avec succès."})
    except Exception as e:
        return Response({"error": str(e)}, status=500)
