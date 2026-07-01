import {test, expect} from '@playwright/test';

//Login function
async function login(page){
    await page.goto('https://eventhub.rahulshettyacademy.com');
    await page.getByPlaceholder('you@email.com').fill('makanda.odwa@gmail.com');
    await page.getByLabel('Password').fill('Issie24!');
    await page.locator('#login-btn').click();
    await expect(page.getByRole('link' , {name: "Browse Events →"})).toBeVisible();
}

//Helper Function
function futureDateValue(daysAhead = 7, hour, minute  = 0){
    const date = new Date();
    date.setDate(date.getDate() + daysAhead);
    date.setHours(hour, minute, 0, 0);

    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

test('Event Creation Test', async({browser}) =>
{
    //Step 1 - Login
    const context = await browser.newContext();
    const page = await context.newPage();
    await login(page);

//Step 2 - Create New Event
   await page.getByRole('button' , {name: "Admin"}).click();
   await expect(page.getByRole('link' , { name: "Manage Events"}).first()).toBeVisible();
   await page.getByRole('link' , { name: "Manage Events"}).first().click();
   await page.getByRole('heading' , { name: '+ New Event'}).waitFor();
   const eventTitle = `Test Event ${Date.now()}`;
   await page.locator('#event-title-input').fill(eventTitle);
   await page.locator('#admin-event-form textarea').pressSequentially('Playwright workshop', {delay: 100});
   const categoryOptions = page.locator('#category');
   await categoryOptions.selectOption('Workshop')
   await expect(page.getByLabel('Category')).toHaveValue('Workshop');
   await page.getByLabel('City').fill('Cape Town');
   await page.getByLabel('Venue').fill('CTICC Converntion Centre');
   await page.getByLabel('Event Date & Time').fill(futureDateValue(10,14,45));
   await page.getByLabel(/price/i).fill('100');
   await page.getByLabel('Total Seats').fill('50');
   await page.locator('#add-event-btn').click();
   await expect(page.getByText('Event created!')).toBeVisible();
   
   
   //Step 3 -  Find the event card and capture seats
   await  page.getByTestId('nav-events').click();
   const eventList = page.getByTestId("event-card");
   await expect(eventList.first()).toBeVisible();
   const myEventCard = await eventList.filter({has: page.locator('h3',{hasText: eventTitle})});
   await expect(myEventCard).toBeVisible();


   const seatsBeforeBooking = 
                Number(
                        (await myEventCard.locator('.items-center span')
                                      .textContent() 
                        ).split(' ')[0]
                      );

    //Step 4 - On the matched event card, click the Book Now button (locate by data-testid="book-now-btn" inside the card)
    await myEventCard.getByTestId('book-now-btn').click();

    //Step 5 - Fill booking form
    const ticketCountText = await page.locator('#ticket-count').textContent();
    await expect(ticketCountText).toBe('1');
    await page.getByLabel('Full Name').fill('Odwa');
    await page.locator('#customer-email').fill('makanda.odwa@gamil.com');
    await page.getByPlaceholder('+91 98765 43210').fill('0213854469');
    await page.locator('.confirm-booking-btn').click();

    //Step 6 - Verify booking confirmation
    await expect(page.locator('.booking-ref')).toBeVisible();
    const bookingRef = (await page.locator('.booking-ref').textContent()).trim();
    
   //Step 7 - Verify in My Bookings
   await Promise.all(
    [
        await page.getByRole('link', { name: 'View My Bookings' }).click(),
        await page.waitForURL('**/bookings'),
    
   ]);

   const bookingCards = page.locator('#booking-card');
   await expect(bookingCards.first()).toBeVisible();
   const myEventBookingCard = await bookingCards.filter({has: page.locator('.booking-ref',{hasText: bookingRef})});
   await expect(myEventBookingCard).toBeVisible();
   const bookingTitle = (await myEventBookingCard.locator('h3').textContent()).trim();
   await expect(bookingTitle).toBe(eventTitle);
  
   
   
  // await expect(page.getByRole('heading', {hasText: 'My Bookings'}).first()).toBeVisible();
  





})