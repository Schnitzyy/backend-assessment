Implementation features:

Full implemented backend logic:

Route /api/items/    - get method for listing all items from the database (one item can include multiple vendors)

Route /api/items/:id - get method for listing a specific item from the database

Route /api/items/    - post method for creating new items with input validation

Route /api/items/:id - put method for updating current items

Route /api/items/:id - delete method for deleting current items

Route /api/analytics/ - get method for viewing all analytics for all items (maxprice, minprice, cheapest vendor)

Partial Implementation of html with no css:

can view/update/delete/add items

- cannot view specific items
  
- cannot search for specific items
  
- basic UI
  
- params/query feature not implemented
  

Pagination included (by default 50 items per page)

Regex Search case insensitive included

Proper status codes included
