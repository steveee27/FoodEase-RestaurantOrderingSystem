# FoodEase - Restaurant Ordering System

**FoodEase** is a web-based food ordering system designed to improve the operational efficiency of restaurants and enhance the customer experience. The application allows customers to browse the menu, search for specific dishes, add items to their cart, and complete orders seamlessly.

## Table of Contents
- [Project Description](#project-description)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
  - [Running the Server](#running-the-server)
  - [Running the Application](#running-the-application)
- [Collaborators](#collaborators)
- [License](#license)
- [Figma Design](#figma-design)

## Project Description

**FoodEase** was created to address several challenges faced by restaurants, particularly in improving customer experience and operational efficiency. Many restaurants still rely on manual, face-to-face ordering, which can be slow and inefficient, especially during peak times. With the integration of a digital food ordering system, FoodEase aims to simplify the ordering process, reduce wait times, and improve the quality of service. The app also includes AI-powered chat assistance to provide personalized recommendations to customers, enhancing their dining experience.

## Features

- **View Menu**: Customers can easily explore the menu with detailed descriptions, prices, and images.
- **Search Menu**: Quickly find dishes based on keywords.
- **Add to Cart & Edit Cart**: Customers can manage their orders before checkout.
- **Checkout**: Fast and efficient payment process.
- **AI Chat Assistance**: Provides real-time, interactive recommendations and answers to customer inquiries.

## Getting Started

To run this application locally, follow the steps below:

### Prerequisites

Make sure you have **Node.js** installed on your machine. If you don't have it yet, you can download it from [here](https://nodejs.org/).

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/steveee27/FoodEase-RestaurantOrderingSystem.git
   ```

2. **Navigate to the project directory:**
   ```bash
   cd FoodEase-RestaurantOrderingSystem
   ```

### Running the Server

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm i
   ```

3. Start the server:
   ```bash
   npx ts-node src/index.ts
   ```

### Running the Application

1. Make sure all dependencies are installed by running:
   ```bash
   npm install
   ```
   This will install all the necessary packages, including `react-scripts`.

2. After that, navigate to the `foodease` directory and start the frontend application:
   ```bash
   cd ../foodease
   npm start
   ```

This will launch the application, and you should be able to access it on your browser at the specified local server address.

## Collaborators

This project is built by the following team members:

- **Ahmad Husain** (2501969536)
- **Elvina Benedicta Santoso** (2602112322)
- **Jennifer Ardelia Limicia** (2602105090)
- **Maria Linneke Adjie** (2602076374)
- **Steve Marcello Liem** (2602071410)
- **Wilbert Chandra** (2602113666)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Figma Design

You can view the design prototype for the **FoodEase** app on Figma using the following link:

[FoodEase Figma Design](https://www.figma.com/proto/ylHbtKvdF9G6423UlyRhUA/FoodEase-SE-1?node-id=76-357&p=f&t=4hyReXgnLjx2KB1M-1&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=1%3A35)

The design includes interactive prototypes and visual layouts for the app’s user interface, helping guide the development process and ensuring a smooth user experience.
