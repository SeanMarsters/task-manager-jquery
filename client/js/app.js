function buildCategorySelect(selectedCategoryId) {
    // send request to server
    $.getJSON('http://localhost:3000/categories').done(function(response) {

        // clear any existing categories
        $('select[name="category"]').empty();

        // loop through response and create categories
        for (var i = 0; i < response.length; i++) {
            $('select[name="category"]').append('<option value="' + response[i].id + '">'+response[i].name + '</option>');
        }

        // if we have a categoryId, select that one
        if (selectedCategoryId) {
            $('select[name="category"]').val(selectedCategoryId);
        }
    });
}

function buildTaskList() {
    // send requests to server
    $.when(
        $.getJSON('http://localhost:3000/categories'),
        $.getJSON('http://localhost:3000/tasks')
    ).then(function(categories, tasks) {
        // clear any existing tasks
        $('.task-list').empty();

        // create category list items
        for (var i = 0; i < categories[0].length; i++) {
            $('.task-list').append('<li>'+categories[0][i].name + '<ul data-categoryId="'+categories[0][i].id+'"></ul></li>');
        }

        // create task list items
        for (var j = 0; j < tasks[0].length; j++) {
            $('.task-list ul[data-categoryId="' + tasks[0][j].category + '"]').append('<li data-status="' + tasks[0][j].status + '"><a href="#" data-taskId="' + tasks[0][j].id + '">' + tasks[0][j].name + '</a></li>');
        }
    });
}

// run once when page loads
buildCategorySelect();
buildTaskList();

// create category
$('.category-form').on('submit', function(e) {
    e.preventDefault();

    // build params object from form fields
    var params = {
        name: $('.category-form input[name="category"]').val()
    };

    // send request to server
    $.ajax({
        url: 'http://localhost:3000/categories',
        data: JSON.stringify(params),
        contentType: 'application/json',
        method: 'post'
    }).done(function(response) {
        buildCategorySelect(response.id);
    });

    // clear form field
    $('.category-form input[name="category"]').val('');
});

// create task
$('.task-form').on('submit', function(e) {
    e.preventDefault();

    // build params object from form fields
    var params = {
        name: $('.task-form input[name="task"]').val(),
        category: $('.task-form select[name="category"]').val()
    };

    // send request to server
    $.ajax({
        url: 'http://localhost:3000/tasks',
        data: JSON.stringify(params),
        contentType: 'application/json',
        method: 'post'
    }).done(function(response) {
        buildTaskList();
    });

    // clear form field
    $('.task-form input[name="task"]').val('');
});

// click event updating status for tasks
$('.task-list').on('click', 'a', function(e) {
    e.preventDefault();

    // get id and status of the task clicked
    var id = $(e.target).attr('data-taskId');
    var status = $(e.target).closest('li').attr('data-status');

    // build params object
    var params = {
        status: (status === '2') ? 0 : 2
    };

    // send request to server
    $.ajax({
        url: 'http://localhost:3000/tasks/' + id,
        data: JSON.stringify(params),
        contentType: 'application/json',
        method: 'put'
    }).done(function(response) {
        buildTaskList();
    });
});

$('.remove-completed').on('click', function(e) {
    e.preventDefault();

    // store ajax requests
    var requests = [];

    // loop through all tasks that are completed
    $('.task-list a[data-status="2"]').each(function() {
        // get id
        var id = $(this).attr('data-taskId');

        // push delete request into array
        requests.push($.ajax({
            url: 'http://localhost:3000/tasks/' + id,
            contentType: 'application/json',
            method: 'delete'
        }));

        // when all requests are done, rebuild task list
        $.when(requests).then(function() {
            buildTaskList();
        });
    });
});
