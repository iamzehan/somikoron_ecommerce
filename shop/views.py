import json

from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core import serializers
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.template.loader import render_to_string
from django.utils import timezone
# Create your views here.
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import ListView, DetailView
from django.views.generic.base import View
from rest_framework import generics

from .forms import CheckoutForm
from .models import *
from .serializers import CartItemsSerializer, QuickViewSerializer


class HomeView(ListView):
    template_name = 'shop/index.html'
    paginate_by = 8
    model = Items

    def get_context_data(self, **kwargs):
        try:
            cartitems = Order.objects.get(user=self.request.user, ordered=False)
        except:
            cartitems = ''
        context = super().get_context_data(**kwargs)
        context['mail'] = 'contact@somikoron.com'
        context['categories'] = get_categories()
        context['cartitems'] = cartitems
        return context


def get_categories():
    return Category.objects.all()


def get_subcategories():
    return SubCategory.objects.all()


class ItemListView(View):
    def get(self, *args, **kwargs):
        items = Items.objects.filter(sub_category_id=kwargs['subid'])
        cat = Category.objects.get(subcategory=kwargs['subid'])
        context = {
            'items'        : items,
            'categories'   : get_categories(),
            'item_category': cat,
        }
        return render(self.request, 'shop/shop_item_list.html', context)


class CategoryItemView(View):
    def get(self, *args, **kwargs):
        cat = Category.objects.get(category_id=kwargs['catid'])
        items = Items.objects.filter(sub_category__category=cat)
        context = {
            'items'        : items,
            'categories'   : get_categories(),
            'item_category': cat,
        }
        return render(self.request, 'shop/shop_item_list.html', context)


class ItemDetailsView(DetailView):
    template_name = 'shop/shop_detail.html'
    model = ItemDetails

    def get_context_data(self, **kwargs):
        context = super(ItemDetailsView, self).get_context_data(**kwargs)
        context['categories'] = get_categories()
        # item = Items.objects.get(pk='GR02')
        # context['images'] = ItemImages.objects.all()
        return context


@login_required
def add_to_cart(request, slug):
    item = get_object_or_404(Items, slug=slug)
    order_item, created = OrderItem.objects.get_or_create(
        item=item,
        user=request.user,
        ordered=False
    )
    order_qs = Order.objects.filter(user=request.user, ordered=False)
    if order_qs.exists():
        order = order_qs[0]
        # check if the order item is in the order
        if order.items.filter(item__slug=item.slug).exists():
            order_item.quantity += 1
            order_item.save()
            messages.success(request, "This item quantity was updated.")
            # return redirect("shop:itemdetails", slug=slug)
            return HttpResponseRedirect(request.META.get('HTTP_REFERER'))
        else:
            order.items.add(order_item)
            messages.success(request, "This item was added to your cart.")
            # return redirect("shop:itemdetails", slug=slug)
            return HttpResponseRedirect(request.META.get('HTTP_REFERER'))
    else:
        ordered_date = timezone.now()
        order = Order.objects.create(
            user=request.user, ordered_date=ordered_date)
        order.items.add(order_item)
        messages.success(request, "This item was added to your cart.")
        # return redirect("shop:itemdetails", slug=slug)
        return HttpResponseRedirect(request.META.get('HTTP_REFERER'))


@login_required
def remove_from_cart(request, slug):
    item = get_object_or_404(Items, slug=slug)
    order_qs = Order.objects.filter(
        user=request.user,
        ordered=False
    )
    if order_qs.exists():
        order = order_qs[0]
        # check if the order item is in the order
        if order.items.filter(item__slug=item.slug).exists():
            order_item = OrderItem.objects.filter(
                item=item,
                user=request.user,
                ordered=False
            )[0]
            order.items.remove(order_item)
            order_item.delete()
            messages.error(request, "This item was removed from your cart.")
            # return redirect("shop:itemdetails", slug=slug)
            return HttpResponseRedirect(request.META.get('HTTP_REFERER'))
        else:
            messages.warning(request, "This item was not in your cart")
            # return redirect("shop:itemdetails", slug=slug)
            return HttpResponseRedirect(request.META.get('HTTP_REFERER'))
    else:
        messages.warning(request, "You do not have an active order")
        # return redirect("shop:itemdetails", slug=slug)
        return HttpResponseRedirect(request.META.get('HTTP_REFERER'))


@login_required
def remove_single_item_from_cart(request, slug):
    item = get_object_or_404(Items, slug=slug)
    order_qs = Order.objects.filter(
        user=request.user,
        ordered=False
    )
    if order_qs.exists():
        order = order_qs[0]
        # check if the order item is in the order
        if order.items.filter(item__slug=item.slug).exists():
            order_item = OrderItem.objects.filter(
                item=item,
                user=request.user,
                ordered=False
            )[0]
            if order_item.quantity > 1:
                order_item.quantity -= 1
                order_item.save()
            else:
                order.items.remove(order_item)
            messages.info(request, "This item quantity was updated.")
            return redirect("shop:order-summary")
        else:
            messages.info(request, "This item was not in your cart")
            return redirect("shop:home", slug=slug)
    else:
        messages.info(request, "You do not have an active order")
        return redirect("shop:home", slug=slug)


def add_to_cart_demo(request):
    return render(request, 'shop/add-to-cart-demo.html')


class OrderSummaryView(LoginRequiredMixin, View):
    def get(self, *args, **kwargs):
        try:
            order = Order.objects.get(user=self.request.user, ordered=False)
            context = {
                'object'    : order,
                'categories': get_categories()
            }
            return render(self.request, 'shop/shop_cart.html', context)
        except ObjectDoesNotExist:
            messages.warning(self.request, "You do not have an active order")
            return redirect("/")


# Demo
@csrf_exempt
def get_cart_items(request):
    print(Order.objects.get(user=request.user, ordered=False))
    items = Order.objects.get(user=request.user, ordered=False)
    data = serializers.serialize('json', [items.items])
    # data = serializers.serialize('json', cart)
    print(data)
    return HttpResponse(data, safe=False)


# endDemo

class CheckoutView(LoginRequiredMixin, View):
    def get(self, *args, **kwargs):
        form = CheckoutForm()
        order = Order.objects.get(user=self.request.user, ordered=False)
        context = {
            'form'      : form,
            'object'    : order,
            'categories': get_categories()
        }
        return render(self.request, 'shop/shop_checkout.html', context)

    def post(self, *args, **kwargs):
        form = CheckoutForm(self.request.POST or None)
        try:
            order = Order.objects.get(user=self.request.user, ordered=False)
            if form.is_valid():
                division = form.cleaned_data.get('division')
                district = form.cleaned_data.get('district')
                street_address = form.cleaned_data.get('street_address')
                apartment_and_house = form.cleaned_data.get('apartment_and_house')
                post_code = form.cleaned_data.get('post_code')
                order_notes = form.cleaned_data.get('order_notes')
                payment_option = form.cleaned_data.get('payment_option')
                print(payment_option)
                if Address.objects.filter(user=self.request.user):
                    shipping_address = Address.objects.get(user=self.request.user)
                    shipping_address.division = division
                    shipping_address.district = district
                    shipping_address.street_address = street_address
                    shipping_address.apartment_and_house = apartment_and_house
                    shipping_address.post_code = post_code
                    shipping_address.save()
                else:
                    shipping_address = Address(
                        user=self.request.user,
                        division=division,
                        district=district,
                        street_address=street_address,
                        apartment_and_house=apartment_and_house,
                        post_code=post_code,
                    )
                    shipping_address.save()

                shipping_address = Address.objects.get(user=self.request.user)
                order.shipping_address = shipping_address
                order.order_note = order_notes
                order.ordered = True
                order.save()
                # messages.success(self.request, "Order placed successfully")
                context = {
                    'object' : order,
                    'address': shipping_address
                }
                return render(self.request, 'shop/shop_order_complete.html', context)
            messages.success(self.request, "Failed! Form is invalid")
            return HttpResponseRedirect(self.request.META.get('HTTP_REFERER'))
        except ObjectDoesNotExist:
            messages.warning(self.request, "You do not have an active order")
            return redirect('shop:order-summary')


class OrderCompleteView(View):
    def get(self, *args, **kwargs):
        return render(self.request, 'shop/shop_order_complete.html')


class CattleshopView(View):

    def get(self, *args, **kwargs):
        sub_category = SubCategory.objects.filter(category__category_id='cattle')
        cattles = Items.objects.filter(sub_category__category__category_id='cattle')
        print(cattles)
        context = {
            'cattles'   : cattles,
            'categories': get_categories(),
        }
        return render(self.request, 'shop/special_offer.html', context)


class QuickView(generics.ListAPIView):
    # def get(self, *args, **kwargs):
        # instance = get_object_or_404(Items, slug='cow1')
        # context = {
        #     'instance': instance
        # }
        # print(instance)
        # return render(self.request, 'shop/quick_view.html', context)

    serializer_class = QuickViewSerializer
    print(serializer_class)
    def post(self, *args, **kwargs):
        queryset = Items.objects.get(slug=kwargs['slug'])
        # data = serializers.serialize('json', [queryset])
        serializer = QuickViewSerializer(queryset)
        return JsonResponse(serializer.data, safe=False, )


def quickview(request):
    result = {'html': render_to_string('your-template.html', {})}
    return HttpResponse(json.dumps(result, ensure_ascii=False),
                        content_type='application/json')


class CartItemView(generics.ListAPIView):
    serializer_class = CartItemsSerializer
    print(serializer_class)

    def post(self, *args, **kwargs):
        queryset = Order.objects.get(user=self.request.user, ordered=False)
        # data = serializers.serialize('json', [queryset])
        serializer = CartItemsSerializer(queryset)
        return JsonResponse(serializer.data, safe=False, )


# demo
def cart_demo(request):
    return render(request, 'shop/cart_demo.html')


def about_us(request):
    return render(request, 'shop/about_us.html', {'categories': get_categories()})


def contact_us(request):
    return render(request, 'shop/contact.html', {'categories': get_categories()})


@csrf_exempt
def plcae_order(request):
    # for a in request.POST.getlist('carts[]'):
    # print(json.loads(request.POST.get('carts')))
    # cartitems = json.loads(request.POST.get('cart'))
    if not request.user.is_authenticated:
        return HttpResponse('false')
    else:
        cart_items = request.POST['carts']
        data = json.loads(cart_items)
        print(data[0]['name'])
        # print(cartitems)
        for cart_item in data:
            print(cart_item['name'])
            print(cart_item['quantity'])
            item = get_object_or_404(Items, product_code=cart_item['name'])
            order_item, created = OrderItem.objects.get_or_create(
                item=item,
                user=request.user,
                ordered=False,
            )
            order_item.quantity=cart_item['quantity']
            order_item.save()
            order_qs = Order.objects.filter(user=request.user, ordered=False)
            if order_qs.exists():
                order = order_qs[0]
                # check if the order item is in the order

                order.items.add(order_item)
                messages.success(request, "This item was added to your cart.")
                # return redirect("shop:itemdetails", slug=slug)
                # return HttpResponseRedirect(request.META.get('HTTP_REFERER'))
            else:
                ordered_date = timezone.now()
                order = Order.objects.create(
                    user=request.user, ordered_date=ordered_date)
                order.items.add(order_item)
                messages.success(request, "This item was added to your cart.")
                # return redirect("shop:itemdetails", slug=slug)
                # return HttpResponseRedirect(request.META.get('HTTP_REFERER'))
    return HttpResponse('true')
