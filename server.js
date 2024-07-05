const express = require('express');
const cors = require('cors');
require('dotenv').config();
const puppeteer = require('puppeteer');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
  

app.post('/newrating', async (req, res) => {
    const handle = req.body.handle;
    console.log(req.body.handle);
    if (!handle) {
        return res.status(400).json({ error: 'Handle is required' });
    }
    console.log(`Fetching rating for handle: ${handle}`);

    try {
       var response = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
       var data = await response.json();
       var rating = data.result[0].rating; 
       var maxRating = data.result[0].maxRating;

        if (rating) {
                console.log('Rating fetched successfully:', rating);
                res.json({ 
                    rating: rating,
                    maxRating: maxRating 
                });
            } else {
                res.status(404).json({ error: 'Rating not found' });
            }

    } catch (error) {
        console.error('Error fetching rating:', error);
        res.status(500).json({ error: 'Failed to fetch rating' });
    }
});

app.post('/newrank', async (req, res) => {
    const handle = req.body.handle;
    console.log(req.body.handle);
    if (!handle) {
        return res.status(400).json({ error: 'Handle is required' });
    }
    console.log(`Fetching rank for handle: ${handle}`);

    try {
       var response = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
       var data = await response.json();
       var rank = data.result[0].rank; 
       var maxRank = data.result[0].maxRank; 

        if (rank) {
                console.log('Rank fetched successfully:', rank);
                res.json({ 
                    rank: rank,
                    maxRank: maxRank
                 });
            } else {
                res.status(404).json({ error: 'Rank not found' });
            }

    } catch (error) {
        console.error('Error fetching rank:', error);
        res.status(500).json({ error: 'Failed to fetch rank' });
    }
});

app.get('/newcontestdetails', async (req, res) => {
    try {
        const browser = await puppeteer.launch({ 
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--no-zygote','--single-process'],
            executablePath: 
            process.env.NODE_ENV ==='production'
            ? process.env.PUPPETEER_EXECUTABLE_PATH
            : puppeteer.executablePath(),
            headless: true
         });
        const page = await browser.newPage();
        await page.goto('https://codeforces.com/contests', { waitUntil: 'networkidle2' });

        
        await page.waitForSelector('#pageContent > div.contestList > div.datatable > div:nth-child(6) > table > tbody > tr:nth-child(2) > td:nth-child(3) > a', { timeout: 10000 });
        await page.waitForSelector('#pageContent > div.contestList > div.datatable > div:nth-child(6) > table > tbody > tr:nth-child(2) > td.dark.left', { timeout: 10000 });

        const contestDateTime = await page.evaluate(() => {
            const dateTimeElement = document.querySelector('#pageContent > div.contestList > div.datatable > div:nth-child(6) > table > tbody > tr:nth-child(2) > td:nth-child(3) > a');
            return dateTimeElement ? dateTimeElement.innerText : null;
        });
       
        const contestName = await page.evaluate(() => {
            const contestNameElement = document.querySelector('#pageContent > div.contestList > div.datatable > div:nth-child(6) > table > tbody > tr:nth-child(2) > td.dark.left');
            return contestNameElement ? contestNameElement.innerText : null;
        });
        
        await browser.close();

        if (contestDateTime&&contestName) {
            console.log('Contest name, date and time fetched successfully:', contestDateTime,contestName);
        
            var contestInfo = (convertDateTimeToIST(contestDateTime));
            contestInfo['contestName'] = contestName;
            res.json({ contestInfo });
        } else {
            res.status(404).json({ error: 'Contest name, date and time not found' });
        }
    } catch (error) {
        console.error('Error fetching contest date and time:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

function convertDateTimeToIST(inputDate) {

    const months = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
      'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
      'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
  
    try {
     
      var [datePart, timePart] = inputDate.split(' ');
      var [month, day, year] = datePart.split('/');
      var time = timePart.split('UTC');
      var [hours, minutes] = time.split(':');

      if (!months[month] || !day || !year || !time) {
        throw new Error('Invalid input date format');
      }
  
      day = parseInt(day);
      month = parseInt(months[month]);
      year = parseInt(year);
      hours = parseInt(hours);
      minutes = parseInt(minutes);
     
      var ampm = hours >= 12 ? 'PM' : 'AM';  
        

      hours = hours % 12;
      hours = hours ? hours : 12;

     var ans = {};

        ans['day'] = day;
        ans['month'] = month;
        ans['year'] = year;
        ans['hours'] = hours;
        ans['minutes'] = minutes;
        ans['ampm'] = ampm;
      

     return ans;
            
    } catch (error) {
      console.error('Error converting date:', error.message);
      return 'Invalid date format';
    }
}

  
  
  


































app.listen(port, () => {
    console.log(`Server running at :${port}`);
})




//https://codeforces.com/api/user.info?handles=HardiKrSingh //cf-api