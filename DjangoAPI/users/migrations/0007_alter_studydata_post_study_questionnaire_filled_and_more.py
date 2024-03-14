# Generated by Django 5.0.2 on 2024-03-14 04:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_studydata'),
    ]

    operations = [
        migrations.AlterField(
            model_name='studydata',
            name='post_study_questionnaire_filled',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='studydata',
            name='pre_study_questionnaire_filled',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='studydata',
            name='study_completed',
            field=models.BooleanField(default=False),
        ),
    ]