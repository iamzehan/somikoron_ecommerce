from django.http import JsonResponse
from rest_framework import serializers

from .models import *


class CartItemsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ('__all__')
        depth = 8


class QuickViewSerializer(serializers.ModelSerializer):
    # item_details = serializers.SerializerMethodField("_details")
    # item_images = serializers.SerializerMethodField("_images")
    # discounted_price = serializers.SerializerMethodField()
    class Meta:
        model = Items
        fields = ('images','itemdetails', 'cattleinfo', 'title', 'price', 'sub_category', 'slug',
                  'description', 'product_code', 'item_owner')
        depth = 2

        # def get_discounted_price(self, obj):  # "get_" + field name
        #     print(obj.get_discounted_price())
        #     return obj.get_discounted_price()
    # def _details(self, obj):
    #     # item = obj.item_details.values_list("item", flat=True)
    #     details = ItemDetails.objects.get(item=obj)
    #     return details
    # def _images(self, obj):
    #     admins = obj.connected_users.values_list("user", flat=True)
    #     admins = Admin.objects.filter(id__in=admins)
    #     return UserSerializer(admins, read_only=True, many=True).data
    # def _cattle_info(self, obj):
    #     admins = obj.connected_users.values_list("user", flat=True)
    #     admins = Admin.objects.filter(id__in=admins)
    #     return UserSerializer(admins, read_only=True, many=True).data
