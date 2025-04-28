from rest_framework import serializers
from .models import CustomUser
from django_otp.plugins.otp_totp.models import TOTPDevice

class UserSerializer(serializers.ModelSerializer):
    is_2fa_enabled = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 'password',
            'is_2fa_enabled',
        )
        extra_kwargs = {
            'password': {'write_only': True},
            'id': {'read_only': True}
        }

    def get_is_2fa_enabled(self, user):
        return TOTPDevice.objects.filter(user=user, confirmed=True).exists()

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password']
        )
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
