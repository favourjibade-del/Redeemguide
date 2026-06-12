from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('locations', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='location',
            name='business_name',
            field=models.CharField(blank=True, max_length=200),
        ),
        migrations.AddField(
            model_name='location',
            name='business_website',
            field=models.URLField(blank=True),
        ),
    ]
