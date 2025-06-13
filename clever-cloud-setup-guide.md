# Clever Cloud MySQL Setup Guide

Follow these steps to set up your free MySQL database on Clever Cloud:

## 1. Create Your Account

1. Go to [clever-cloud.com](https://www.clever-cloud.com/)
2. Click "Sign up" and create an account (GitHub/Google login available)
3. Verify your email address

## 2. Create an Organization

1. After logging in, create an organization if prompted
2. This will be the container for your applications and add-ons

## 3. Create MySQL Add-on

1. In the dashboard, click "Create..." → "an add-on"
2. Select "MySQL"
3. Choose the "DEV" plan (free tier)
4. Name your add-on: "gas-supply-db"
5. Select your organization
6. Click "Create"

## 4. Get Database Credentials

1. Once created, go to the "Information" tab
2. Find your connection information:
   - Host
   - Port
   - Database name
   - Username
   - Password

## 5. Import Database Schema

1. In the "Information" tab, find the "MySQL CLI" command
2. Use this command to connect to your database from your terminal
3. Or use a MySQL client like MySQL Workbench with the credentials
4. Run the clever-cloud-setup.sql script to create your tables

## 6. Configure Environment Variables for Render

Add these environment variables to your Render deployment:
\`\`\`
MYSQL_HOST=your_clever_cloud_host
MYSQL_USER=your_clever_cloud_user
MYSQL_PASSWORD=your_clever_cloud_password
MYSQL_DATABASE=your_clever_cloud_database
MYSQL_PORT=3306
JWT_SECRET=your_secret_key
\`\`\`

## 7. Limitations of Free Tier

- 256MB RAM
- 5 connections maximum
- 10MB storage
- Perfect for development and small applications
