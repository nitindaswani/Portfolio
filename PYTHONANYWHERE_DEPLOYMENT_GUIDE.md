# Complete Deployment Guide: Django Portfolio to PythonAnywhere with MySQL

This guide will walk you through deploying your Django portfolio project on PythonAnywhere's free tier and configuring it to use MySQL database.

---

## **Part 1: Pre-Deployment Preparation**

### Step 1: Update Requirements

Your `requirements.txt` has been updated to include `PyMySQL` instead of PostgreSQL driver:

```
Django==5.2.10
python-dotenv==1.2.1
google-generativeai==0.8.6
Pillow==11.1.0
gunicorn==23.0.0
whitenoise==6.11.0
dj-database-url==2.1.0
PyMySQL==1.1.0
```

### Step 2: Create a .gitignore (if not already present)

Make sure these files are NOT tracked in Git:

```
.env
db.sqlite3
*.pyc
__pycache__/
.DS_Store
media/
staticfiles/
```

### Step 3: Commit Changes Locally

```bash
git add requirements.txt
git commit -m "Replace PostgreSQL with PyMySQL for PythonAnywhere deployment"
git push origin main
```

---

## **Part 2: PythonAnywhere Setup**

### Step 4: Create a PythonAnywhere Account

1. Go to https://www.pythonanywhere.com/
2. Click **Pricing** and select the **Free** tier
3. Sign up with your email or GitHub account
4. Verify your email

### Step 5: Access PythonAnywhere Dashboard

- Log in to your PythonAnywhere account at https://www.pythonanywhere.com/
- You should see the main dashboard

---

## **Part 3: Clone Your Repository**

### Step 6: Open a Bash Console

1. Click on the **Consoles** tab at the top
2. Click **Bash** to open a new bash console
3. You'll see a terminal environment

### Step 7: Clone Your GitHub Repository

In the bash console, run:

```bash
cd ~
git clone https://github.com/yourusername/portfolio.git portfolio_project
cd portfolio_project
```

_(Replace `yourusername` with your actual GitHub username)_

Verify the clone:

```bash
ls -la
```

You should see all your project files.

---

## **Part 4: Set Up Virtual Environment**

### Step 8: Create a Virtual Environment

In the bash console, run:

```bash
mkvirtualenv --python=/usr/bin/python3.10 portfolio-env
```

This creates and activates a virtual environment named `portfolio-env` using Python 3.10.

### Step 9: Install Dependencies

Make sure you're in the project directory and the virtual environment is activated:

```bash
cd ~/portfolio_project
pip install -r requirements.txt
```

Wait for all packages to install. This may take 2-3 minutes.

### Step 10: Verify Installation

```bash
pip list
```

You should see Django 5.2.10, PyMySQL, and other dependencies listed.

---

## **Part 5: Set Up MySQL Database**

### Step 11: Create a MySQL Database

1. Click on the **Databases** tab at the top
2. You should see a MySQL section
3. Click the **Create a new database** link
4. A new database will be created with the name: `yourusername$portfolio_db`
   _(For example: `nitin$portfolio_db` if your username is `nitin`)_

**Important**: Note down your **database name** - you'll need it in the next step.

### Step 12: Create MySQL User (if needed)

Most databases on PythonAnywhere are automatically created with the corresponding user. However:

1. Your MySQL username is your PythonAnywhere username
2. Your MySQL password is your PythonAnywhere password
3. The hostname is `yourusername.mysql.pythonanywhere-services.com` or similar

If you need to reset your MySQL password:

1. Go to **Account** → **Security**
2. Look for password reset options

---

## **Part 6: Create Environment Variables File**

### Step 13: Create .env File on PythonAnywhere

In the bash console:

```bash
cd ~/portfolio_project
nano .env
```

Add the following content (update with your actual values):

```
DEBUG=False
SECRET_KEY=your-secret-key-here-use-a-strong-random-string
ALLOWED_HOSTS=yourusername.pythonanywhere.com
DATABASE_URL=mysql://yourusername:yourpassword@yourusername.mysql.pythonanywhere-services.com/yourusername$portfolio_db
```

**To generate a strong SECRET_KEY**, you can run in the bash console:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Then paste the output into your SECRET_KEY value.

**Save the file**: Press `Ctrl+O`, then `Enter`, then `Ctrl+X`

### Step 14: Update settings.py for Environment Variables

Your `settings.py` already loads the `.env` file, so no changes are needed there. However, ensure the `DATABASE_URL` is being used correctly.

The line in settings.py:

```python
DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite://{BASE_DIR}/db.sqlite3", conn_max_age=600
    )
}
```

Will automatically pick up your MySQL URL from the `DATABASE_URL` environment variable.

---

## **Part 7: Create Web App on PythonAnywhere**

### Step 15: Add a New Web App

1. Click on the **Web** tab at the top
2. Click the **Add a new web app** button
3. Choose **Manual Configuration** (important for existing projects)
4. Select **Python 3.10**

### Step 16: Configure Web App Settings

#### A. Find Your Virtualenv Path

In the bash console:

```bash
pwd
```

This shows your current path. Your virtualenv is at:

```
/home/yourusername/.virtualenvs/portfolio-env
```

#### B. Configure Virtualenv

1. On the **Web** page, scroll down to the **Virtualenv** section
2. Click on the text field and enter: `/home/yourusername/.virtualenvs/portfolio-env`
3. Click the checkmark to confirm

#### C. Configure Code Section

Still on the **Web** page:

- **Source code**: `/home/yourusername/portfolio_project`
- **Working directory**: `/home/yourusername/portfolio_project`

Click the checkmark for each to confirm.

#### D. Set Up Web App Environment Variables

1. Scroll to find the **Environment variables** section (labeled "Web app environment variables")
2. Click on "Edit environment variables"
3. Add the following variables:
   - `DEBUG`: `False`
   - `SECRET_KEY`: _(paste your generated key from Step 13)_
   - `ALLOWED_HOSTS`: `yourusername.pythonanywhere.com`
   - `DATABASE_URL`: `mysql://yourusername:yourpassword@yourusername.mysql.pythonanywhere-services.com/yourusername$portfolio_db`

> **Note**: Setting environment variables in the Web tab is the recommended approach for PythonAnywhere's web process, as `.env` files are not automatically loaded.

---

## **Part 8: Configure WSGI File**

### Step 17: Edit WSGI Configuration File

1. On the **Web** page, look for the **WSGI configuration file** section
2. Click on the path to the WSGI file (e.g., `/var/www/yourusername_pythonanywhere_com_wsgi.py`)
3. This opens the file editor
4. **Replace the entire content** with:

```python
import os
import sys
from pathlib import Path

# Add your project directory to sys.path
path = os.path.expanduser('/home/yourusername/portfolio_project')
if path not in sys.path:
    sys.path.append(path)

# Set up Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'portfolio_project.settings')

# Import and get WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

_(Replace `yourusername` with your actual PythonAnywhere username)_

5. Click **Save** (Ctrl+S)

---

## **Part 9: Run Django Migrations**

### Step 18: Collect Static Files

In the bash console:

```bash
cd ~/portfolio_project
source ~/.virtualenvs/portfolio-env/bin/activate
python manage.py collectstatic --noinput
```

This collects all static files (CSS, JS, images) into the `staticfiles` directory for serving.

### Step 19: Run Migrations

In the bash console:

```bash
cd ~/portfolio_project
source ~/.virtualenvs/portfolio-env/bin/activate
python manage.py migrate
```

This creates all necessary database tables in your MySQL database.

### Step 20: Load Initial Data (if any)

If you have any fixtures or initial data:

```bash
python manage.py loaddata initial_data
```

_(Skip this if you don't have initial data)_

### Step 21: Create a Superuser (Optional but Recommended)

To access the Django admin:

```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin account.

---

## **Part 10: Deploy and Test**

### Step 22: Reload Web App

1. Go back to the **Web** tab
2. Click the **Reload** button at the top
3. Wait 10-15 seconds for the app to restart

### Step 23: Test Your Deployment

1. Visit your website: `https://yourusername.pythonanywhere.com`
2. Your portfolio should now be live!

If you created a superuser, you can access the admin at:

- `https://yourusername.pythonanywhere.com/admin`

### Step 24: Check for Errors

If your site shows a 500 error:

1. Go to the **Web** tab
2. Scroll down to view the **Error log**
3. Read the error messages to diagnose issues
4. Make fixes and reload

> **Common Issues**:
>
> - **Import errors**: Make sure all dependencies are installed in the virtualenv
> - **Database errors**: Verify your DATABASE_URL environment variable is correct
> - **Static files not showing**: Run `collectstatic` again and reload the web app
> - **Permission denied errors**: Check file ownership and permissions

---

## **Part 11: Update Your Code Later (Workflow)**

### When You Make Changes Locally:

1. **Commit and push** to GitHub:

   ```bash
   git add .
   git commit -m "Your message"
   git push origin main
   ```

2. **Pull changes on PythonAnywhere** (in the bash console):

   ```bash
   cd ~/portfolio_project
   git pull origin main
   ```

3. **If you changed models**, run migrations:

   ```bash
   source ~/.virtualenvs/portfolio-env/bin/activate
   python manage.py migrate
   ```

4. **If you changed static files**, collect them:

   ```bash
   python manage.py collectstatic --noinput
   ```

5. **Reload the web app** on the **Web** tab

---

## **Part 12: Useful Commands Reference**

### Activate Virtual Environment

```bash
source ~/.virtualenvs/portfolio-env/bin/activate
```

### Deactivate Virtual Environment

```bash
deactivate
```

### Access Django Shell

```bash
source ~/.virtualenvs/portfolio-env/bin/activate
cd ~/portfolio_project
python manage.py shell
```

### Check Database Connection

```bash
python manage.py dbshell
```

### View Error Logs

On the **Web** tab, scroll down to see:

- **Error log**
- **Access log**
- **Server log**

### Restart the Web App

Click the **Reload** button on the **Web** tab

---

## **Troubleshooting**

### Database Connection Issues

- **Error**: `Can't connect to MySQL server`
- **Solution**:
  - Verify DATABASE_URL is correct
  - Check that MySQL database was created
  - Confirm credentials in environment variables
  - Test connection: `python manage.py dbshell`

### Import Errors

- **Error**: `ModuleNotFoundError: No module named 'X'`
- **Solution**:
  - Verify all dependencies in `requirements.txt`
  - Reinstall: `pip install -r requirements.txt`
  - Reload web app

### Static Files Not Loading

- **Error**: CSS/images not showing on website
- **Solution**:
  - Run: `python manage.py collectstatic --noinput`
  - Reload web app
  - Check `STATIC_URL` and `STATIC_ROOT` in settings.py

### 500 Errors

- **Solution**:
  - Check the **Error log** tab on the Web page
  - Ensure DEBUG=False is set
  - Check DATABASE_URL connection
  - Verify ALLOWED_HOSTS includes your domain

### Still Having Issues?

1. Check the error logs on PythonAnywhere
2. Review this guide carefully
3. Visit PythonAnywhere help: https://help.pythonanywhere.com/
4. Django documentation: https://docs.djangoproject.com/en/5.2/

---

## **Summary Checklist**

- [ ] Updated requirements.txt with PyMySQL
- [ ] Created PythonAnywhere free account
- [ ] Cloned repository on PythonAnywhere
- [ ] Created virtual environment
- [ ] Installed dependencies
- [ ] Created MySQL database
- [ ] Set environment variables
- [ ] Configured WSGI file
- [ ] Ran migrations
- [ ] Collected static files
- [ ] Reloaded web app
- [ ] Tested website at `https://yourusername.pythonanywhere.com`
- [ ] Created superuser (optional)

**Congratulations! Your portfolio is now live on PythonAnywhere with MySQL!** 🎉

---

## **Next Steps**

- **Set up a custom domain** (if desired, through PythonAnywhere)
- **Enable HTTPS** (automatic on PythonAnywhere)
- **Monitor logs** regularly for errors
- **Keep dependencies updated** periodically
- **Back up your database** regularly

For more information, visit PythonAnywhere's official documentation: https://www.pythonanywhere.com/help/
