from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Summary

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("username", "email", "password")

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )

class SummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Summary
        fields = ("id", "file_name", "summary_text", "created_at")
        read_only_fields = ("id", "created_at")
