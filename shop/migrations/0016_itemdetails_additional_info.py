# Generated by Django 3.0.7 on 2020-07-05 13:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shop', '0015_order_order_note'),
    ]

    operations = [
        migrations.AddField(
            model_name='itemdetails',
            name='additional_info',
            field=models.CharField(blank=True, max_length=500, null=True),
        ),
    ]
