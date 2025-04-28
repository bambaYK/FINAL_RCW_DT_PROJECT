from rest_framework import serializers
from .models import Library, Emprunt, Subscription

class LibrarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Library
        fields = '__all__'

class EmpruntSerializer(serializers.ModelSerializer):
    resource = LibrarySerializer(read_only=True)
    
    class Meta:
        model = Emprunt
        fields = ('id', 'user', 'resource', 'date_emprunt', 'date_retour', 'est_retourne')
        read_only_fields = ('user', 'date_retour', 'est_retourne')

class SubscriptionSerializer(serializers.ModelSerializer):
    days_remaining = serializers.IntegerField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Subscription
        fields = ('id', 'type', 'price', 'start_date', 'end_date', 'status', 
                 'days_remaining', 'is_active')
        read_only_fields = ('start_date', 'end_date', 'status')