from django.db import models

class Project(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='projects/', blank=True, null=True)
    tech_stack = models.CharField(max_length=200, help_text="Comma-separated tech stack")
    link = models.URLField(blank=True, null=True)
    github_link = models.URLField(blank=True, null=True, help_text="GitHub repository link")
    category = models.CharField(max_length=50)

    def __str__(self):
        return self.title

class Skill(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    proficiency = models.IntegerField(default=50, help_text="Percentage 0-100")

    def __str__(self):
        return f"{self.name} ({self.category})"

class TimelineEvent(models.Model):
    date = models.CharField(max_length=50)
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.date} - {self.title}"

