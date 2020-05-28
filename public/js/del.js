$(document).ready(function () {

    $('.delete-product').on('click', function (e) {
        if (confirm("Delete Product?")) {
            deleteProd(e);
        } else {
            alert("Operation Cancelled!");
        }
    })

    $('.delete-account').on('click', function (e) {
        if (confirm("Delete Account?")) {
            deleteAcc(e);
        } else {
            alert("Operation Cancelled!");
        }
    })

    $('.delete-image').on('click', function (e) {
        if (confirm("Delete Image?")) {
            deleteImg(e);
        } else {
            alert("Operation Cancelled!");
        }
    })

    $('.make-product-image').on('click', function (e) {
        if (confirm("Update Profile Image?")) {
            updateImg(e);
        } else {
            alert("Operation Cancelled!");
        }
    })
    $('.delete-profile-image').on('click', function (e) {
        if (confirm("Update Profile Image?")) {
            deleteProfileImg(e);
        } else {
            alert("Operation Cancelled!");
        }
    })

    function deleteAcc(e) {
        $target = $(e.target);
        const id = $target.attr('data-id');
        console.log(id);

        $.ajax({
            type: 'DELETE',
            url: '/users/profile/' + id,
            success: function (response) {
                alert('Account Deleted!');
                window.location.href = '/users/register';
            },
            error: function (error) {
                console.log(error);
            }
        })
    };

    function deleteProd(e) {
        $target = $(e.target);
        const id = $target.attr('data-id');
        console.log(id);

        $.ajax({
            type: 'DELETE',
            url: '/products/' + id,
            success: function (response) {
                alert('Product Deleted!');
                window.location.href = '/';
            },
            error: function (error) {
                console.log(error);
            }
        })
    };

    function deleteImg(e) {
        $target = $(e.target);
        const data = $target.attr('data-id');
        console.log(JSON.parse(data));

        $.ajax({
            type: 'GET',
            url: '/products/gallery/deleteimage',
            contentType: 'application/json',
            data: JSON.parse(data),
            success: function (response) {
                window.location.reload();
            },
            error: function (error) {
                console.log(error);
            }
        })
    };

    function updateImg(e) {
        $target = $(e.target);
        const data = $target.attr('data-id');
        console.log(JSON.parse(data));

        $.ajax({
            type: 'GET',
            url: '/products/gallery/productimage',
            contentType: 'application/json',
            data: JSON.parse(data),
            success: function (response) {
                window.location.reload();
            },
            error: function (error) {
                console.log(error);
            }
        })
    };

    function deleteProfileImg(e) {
        $target = $(e.target);
        const id = $target.attr('data-id');
        console.log(id);

        $.ajax({
            type: 'DELETE',
            url: '/users/profile/' + id,
            success: function (response) {
                alert('Account Deleted!');
                window.location.href = '/users/register';
            },
            error: function (error) {
                console.log(error);
            }
        })
    };

})
