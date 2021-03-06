![DinoTemplate](https://raw.githubusercontent.com/addisonleong/dinotemplate/master/dinotemplate.png)
## Simple templating for Express

This is an experimental project testing the power of using nothing but barebones templating for Express.

## Installation
Place dino.js in the templates directory at the root of your project.
```
app.engine('dino', require('./templates/dino').express);
app.set('views', './views');
app.set('view engine', 'dino');
```

## Usage

### Static files
All DinoTemplates are formatted like HTML files, but should have the extension ".dino". Place files in the views directory that you created. It's simple to call a view:
```
response.render('index');
```

### Partials
You can create partial dino templates and call them in other templates. An example is:
```
<%= include partial %>
```
All partials are stored in the **partials** directory of the **views** directory. Partials are useful because they can be used to render elements like headers and footers without cluttering HTML. Additionally, partials maintain the options passed to their parents, so one can include additional options inside of the partials.

### Options
Options enable you to add dynamic content to your templates. Options are specified as JSON objects, where each key corresponds to a key written in the template. Before getting into this, we give a small example:

In our routes:
```
options = {
    title: "Dino"
};
response.render('index', options);
```

In index.dino:
```
<%= title %>
```

In this example, "<%= title %>" will be replaced with "Dino" accordings to the options we passed to the template. Options are interpretive, so if for example we have a dictionary option such as:
```
options = {
    titles: [
        "Dino"
    ]
};
```
Then we can easily render:
```
<%= titles[0] %>
```

### Components
Components are useful for creating repetitive dynamic content. Like partials, you can define a template that gets rendered in another template. The difference with components is that they allow you to pass options to a partial and render multiple in succession. To do this, define an array in the options passed to the template, and place the template you want to render in the **components** directory of the **views** directory. An example:

In our routes:
```
options = {
    titles: [
            {
                title: "Dino"
            },
            {
                title: "Express"
            }
    ]
};
response.render('index', options);
```

In index.dino:
```
<%= foreach in titles render title %>
```

In title.dino:
```
<h1><%= title %></h1>
```

Let us explain the syntax of the render. The "render" term signals that we are going to render a component. The "with" terms tells us what option we are pulling data from. So our scheme is:
```
<%= foreach in array render component %>
```

In our example we render a component for each element in the "titles" array. So we render:
```
<h1>Dino</h1>
<h1>Express</h1>
```

### Conditionals
Conditionals are good for rendering specific protocols given a certain state. One instance of this would be if you want to render a user menu bar, but only if a user is logged in. To use conditionals, we need to specify the variable we will condition on and the value it should expect. We set the actual value of the variable in the options dictionary. Here's an example:

In our routes:
```
options = {
    shouldRender: true
};
```

In index.dino:
```
<% if (shouldRender==true) then (include header) %>
```

What happens here is simple. If **shouldRender** is specified to "true" in the options (it is), then we execute the protocol to include the header partial. Our scheme is therefore:
```
<%= if (variable==value) then (protocol) %>
```