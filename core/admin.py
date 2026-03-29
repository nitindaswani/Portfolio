from django.contrib import admin
from .models import Project, Skill, TimelineEvent

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'tech_stack')
    search_fields = ('title', 'category')

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'proficiency')
    list_filter = ('category',)
    search_fields = ('name',)

@admin.register(TimelineEvent)
class TimelineEventAdmin(admin.ModelAdmin):
    list_display = ('date', 'title', 'category')
    search_fields = ('title', 'date')

