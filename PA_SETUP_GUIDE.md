# PythonAnywhere Setup Guide for Django

This guide will help you set up your portfolio project on PythonAnywhere.

## 1. Upload your code
- You can either upload your code via the **Files** tab or use **Git** to clone your repository in a Bash console.

## 2. Create a Virtual Environment
Open a Bash console and run:
```bash
mkvirtualenv --python=/usr/bin/python3.10 my-env
pip install -r requirements.txt
```

## 3. Configure the Web App
Go to the **Web** tab and click **Add a new web app**.
- Choose **Manual Configuration** (highly recommended for existing projects).
- Choose **Python 3.10** (or whichever version you used in your virtualenv).

### Virtualenv
- Scroll down to the **Virtualenv** section and enter the path to your env (e.g., `/home/yourusername/.virtualenvs/my-env`).

### Code Section
- **Source code**: `/home/yourusername/portfolio_project`
- **Working directory**: `/home/yourusername/portfolio_project`

### WSGI Configuration File
Click the link to edit the **WSGI configuration file**. Replace its entire contents with:

```python
import os
import sys

# Add your project directory to the sys.path
path = '/home/yourusername/portfolio_project'
if path not in sys.path:
    sys.path.append(path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'portfolio_project.settings'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```
*(Replace `yourusername` with your actual PythonAnywhere username.)*

## 4. Environment Variables
PythonAnywhere doesn't load `.env` files automatically for the web process. You have two options:
1.  **Option A (Recommended)**: Set them in the **Web** tab under the **Environment variables** section (Post-Setup).
2.  **Option B**: Load them in your `wsgi.py` file or the PA WSGI file:
    ```python
    from dotenv import load_dotenv
    project_folder = os.path.expanduser('~/portfolio_project')
    load_dotenv(os.path.join(project_folder, '.env'))
    ```

## 5. Static Files
In the **Web** tab, go to the **Static files** section:
- **URL**: `/static/`
- **Directory**: `/home/yourusername/portfolio_project/staticfiles`

Then run this command in your Bash console:
```bash
python manage.py collectstatic
```

## 6. Reload
Go to the top of the **Web** tab and click the big green **Reload** button!

---
> [!TIP]
> Make sure to update your `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS` in your `.env` file or PythonAnywhere Environment variables:
> - `ALLOWED_HOSTS=yourusername.pythonanywhere.com`
> - `CSRF_TRUSTED_ORIGINS=https://yourusername.pythonanywhere.com`
