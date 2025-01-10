// set up a express server
const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();




const app = express();

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());




app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

const port = 3300;

app.get('/', (req, res) => {
    if (req.session.loggedin) {
        return;
    } else {
        res.render(__dirname + '/views/login.ejs');
    }
})

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
})

app.post('/auth', (req, res) => {
    let username = req.body.username;
    let hashPassword = req.body.password;
    if (username && hashPassword) {
        if (username === process.env.ADMINUSERNAME && hashPassword === process.env.PASSWORD) {
            req.session.loggedin = true;
            req.session.username = username;
            res.redirect('/addLink');
        } else {
            res.send('Incorrect Username and/or Password!');
        }
        res.end();
    } else {
        res.send('Please enter Username and Password!');
        res.end();
    }

})

app.get('/addLink', (req, res) => {
    if (req.session.loggedin) {
        let rawdata = fs.readFileSync('public/domainName.json');
        let domainName = JSON.parse(rawdata);
        let domain = domainName.domain;
        res.render(__dirname + '/views/addLink.ejs',
            {
                domain: domain
            }
        );
    } else {
        res.redirect('/');
    }

});

app.get('/linkExists/:shortLink', (req, res) => {
    let rawdata = fs.readFileSync('public/links.json');
    let links = JSON.parse(rawdata);
    let shortLink = req.params.shortLink;
    let linkExists = false;
    links.forEach(link => {
        if (link.short === shortLink) {
            linkExists = true;
        }
    });
    if (linkExists) {
        res.status(405).send('Link exist');

    } else {
        res.send(linkExists);
    }
});



app.post('/addLink/:short', (req, res) => {
    let longLink = req.query.lonklink;
    longLink = longLink.replace(/"/g, '');
    let link = 'https://' + longLink
    let short = req.params.short;
    console.log(link, short);
    let rawdata = fs.readFileSync('public/links.json');
    let links = JSON.parse(rawdata);
    links.push({ link: link, short: short });
    fs.writeFileSync('public/links.json', JSON.stringify(links));
    res.send('Link added successfully');
});

app.get('/allLinks', (req, res) => {
    if (req.session.loggedin) {
        let rawdata = fs.readFileSync('public/links.json');
        let links = JSON.parse(rawdata);
        res.send(links);
    } else {
        res.redirect('/');
    }
});

app.get('/manageLinks', (req, res) => {
    if (req.session.loggedin) {
        let rawdata = fs.readFileSync('public/links.json');
        let domainData = fs.readFileSync('public/domainName.json');
        let domain = JSON.parse(domainData);
        let links = JSON.parse(rawdata);
        res.render(__dirname + '/views/manageLinks.ejs',
            {
                links: links,
                domain: domain.domain
            }
        );
    }
    else {
        res.redirect('/');
    }
})

app.get('/deleteLink/:short', (req, res) => {
    let short = req.params.short;
    let rawdata = fs.readFileSync('public/links.json');
    let links = JSON.parse(rawdata);
    let newLinks = links.filter(link => link.short !== short);
    fs.writeFileSyncg('public/links.json', JSON.stringify(newLinks));
    res.send('Link deleted successfully');
});



app.get('/l/:short', (req, res) => {
    let short = req.params.short;
    let rawdata = fs.readFileSync('public/links.json');
    let links = JSON.parse(rawdata);
    let link = '';
    links.forEach(linkObj => {
        if (linkObj.short === short) {
            link = linkObj.link;
        }
    });
    console.log(link);
    // open a new tab with the link
    res.redirect(link);
});






app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});