
//funciones propias de la app
const urlApi = "http://localhost:8088";//colocar la url con el puerto

async function login() {
    var myForm = document.getElementById("loginForm");
    var formData = new FormData(myForm);
    var jsonData = {};
    for (var [k, v] of formData) {//convertimos los datos a json
        jsonData[k] = v;
    }
    var settings = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData)
    }
    const request = await fetch(urlApi + "/auth/login", settings);
    //console.log(await request.text());
    if (request.ok) {
        const respuesta = await request.json();
        localStorage.token = "Bearer " + respuesta.data.token;

        //localStorage.token = respuesta;
        localStorage.email = jsonData.email;
        location.href = "dashboard.html";
    }
}

function listar() {
    validaToken();
    var settings = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': localStorage.token
        },
    }
    fetch(urlApi + "/user", settings)
        .then(response => response.json())
        .then((response) => {

            var usuarios = `
            <div class="p-3 mb-2 bg-light text-dark">
                <h1 class="display-5 fw-bold"><i class="fa-solid fa-list"></i> LISTADO DE USUARIOS</h1>
            </div>
            
            <a href="#" onclick="userRegister()" class="btn btn-outline-success"><i class="fa-solid fa-user-plus"></i></a>
            <table class="table">
                <thead>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">First Name</th>
                    <th scope="col">Last Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Action</th>
                </tr>
                </thead>
                <tbody id="listaBody"></tbody>
            </table>
            `;
            document.getElementById("lista").innerHTML = usuarios;
            datos = '';
            for (const usuario of response.data) {
                fetch(urlApi + "/vehiclesUser", {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.token
                    },
                    body: JSON.stringify({
                        id: usuario.id
                    }),
                })
                    .then(res => res.json())
                    .then((res) => {
                        datos += `
                    <tr>
                        <th scope="row">${usuario.id}</th>
                        <td>${usuario.firstName}</td>
                        <td>${usuario.lastName}</td>
                        <td>${usuario.email}</td>
                        <td>
                        <a href="#" onclick="verModificarUsuario('${usuario.id}')" class="btn btn-outline-warning">
                            <i class="fa-solid fa-user-pen"></i>
                        </a>
                        <a href="#" onclick="verUsuario('${usuario.id}')" class="btn btn-outline-info">
                            <i class="fa-solid fa-eye"></i>
                        </a>

                        ${res.data ? `
                        <a href="#"  onclick="verVehiculoUsuario('${usuario.id}')" class="btn btn-outline-success cyan">
                            <i class="fa-solid fa-id-card"></i>
                        </a>`
                                : `<a href="#" onclick="noVehiculoUsuario()"  class="btn btn-outline-danger" disabled>
                            <i class="fa-solid fa-id-card"></i>
                            </a>`
                            }

                        </td>
                    </tr>`;
                        document.getElementById("listaBody").innerHTML = datos;
                    })



            }

        })
}
function noVehiculoUsuario(){
    alertas("Este Usuario no tiene vehiculos en propiedad!", 0);
}

function verVehiculoUsuario(id) {

    validaToken();

    fetch(urlApi + "/vehiclesUser", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': localStorage.token
        },
        body: JSON.stringify({
            id: id
        }),
    })
        .then(response => response.json())
        .then((response) => {
            usuario = response.data;
            var cadena = '';
            if (usuario) {
                cadena = `
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Gestion de Compras</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" >
                    <div class="p-3 mb-2 bg-light text-dark">
                        <h1 class="display-5"><i class="fa-solid fa-id-card"></i> Ver Compra</h1>
                    </div>
                    <div id="listaPropiedad"></div>
                </div>`;
                document.getElementById("contentModal").innerHTML = cadena;
                datos = '';
                for (const data of usuario) {
                    datos += `
                   
                <div class="modal-body" >
                    <div class="p-3 mb-2 bg-light text-dark">
                        <h1 class="display-5"><i class="fa-solid fa-user"></i> Visualizar Usuario</h1>
                    </div>
                    <ul class="list-group">
                        <li class="list-group-item">Placa: ${data.vehiclesId.car_vin}</li>
                        <li class="list-group-item">Vehiculo:  ${data.vehiclesId.car}</li>
                        <li class="list-group-item">Usuario: ${data.userId.firstName} ${data.userId.lastName}</li>
                        <li class="list-group-item">Modelo: ${data.vehiclesId.car_model}</li>
                        <li class="list-group-item">Color: ${data.vehiclesId.car_color}</li>
                    </ul>
                </div>
                <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Gestion de usuarios</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
                    `;
                    document.getElementById("listaPropiedad").innerHTML = datos;
                }




            }

            var myModal = new bootstrap.Modal(document.getElementById('modalUsuario'))
            myModal.toggle();
        })

}

function listarVehiculos() {
    validaToken();
    var settings = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': localStorage.token
        },
    }
    fetch(urlApi + "/vehicles", settings)
        .then(response => response.json())
        .then((response) => {
            response=response.data;
            let vehiculos = `
            <div class="p-3 mb-2 bg-light text-dark">
                <h1 class="display-5 fw-bold"><i class="fa-solid fa-list"></i> LISTADO DE VEHICULOS</h1>
            </div>
            ${response?'':`<a href="#" onclick="registarVehiculos()" class="btn btn-outline-success"><i class="fa-solid fa-car"></i></a>`}
            <table class="table">
                <thead>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">Marca</th>
                    <th scope="col">Modelo</th>
                    <th scope="col">Color</th>
                    <th scope="col">Año</th>
                    <th scope="col">Placa</th>
                    <th scope="col">Precio</th>
                    <th scope="col">Accion</th>
                </tr>
                </thead>
                <tbody>
            `;
            if(response){
                for (const vehiculo of response) {
                    vehiculos += `
                    <tr>
                        <th scope="row">${vehiculo.id}</th>
                        <td>${vehiculo.car}</td>
                        <td>${vehiculo.car_model}</td>
                        <td>${vehiculo.car_color}</td>
                        <td>${vehiculo.car_model_year}</td>
                        <td>${vehiculo.car_vin}</td>
                        <td>${vehiculo.price}</td>

                        <td>
                        <a href="#" onclick="verModificarVehiculo('${vehiculo.id}')" class="btn btn-outline-warning">
                            <i class="fa-solid fa-edit"></i>
                        </a>
                        <a href="#" onclick="verVehiculo('${vehiculo.id}')" class="btn btn-outline-info">
                            <i class="fa-solid fa-eye"></i>
                        </a>

                        ${vehiculo.availability ? `
                            <a href="#" onclick="verVenderVehiculo('${vehiculo.id}')" class="btn btn-outline-success cyan">
                                <i class="fa-solid fa-ticket"></i>
                            </a>`
                            : `<a href="#"  onclick="VehiculoNoDisponible()" class="btn btn-outline-danger" disabled>
                                <i class="fa-solid fa-ticket"></i>
                                </a>`
                        }
                        
                        </td>
                    </tr>`;

                }
            }
                vehiculos += `</tbody>
                </table>`
                document.getElementById("lista").innerHTML = vehiculos;
            })
        
}

function registarVehiculos(){
    validaToken();
    Swal.fire({
        title: 'Guardando Vehiculos',
        didOpen: () => {
          Swal.showLoading()
          
        },
        didRender:()=>{
            fetch(urlApi + "/saveVehicles", {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': localStorage.token
                },
            })
                .then(response => response.json())
                .then((response) => {
                    listarVehiculos();
                    swal.close();
                    
                })
        }
      })
}

function verVenderVehiculo(id) {
    validaToken();
    var cadena = '';
    if (id) {
        cadena = `
        <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Gestion de Ventas</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body" >
        <div class="p-3 mb-2 bg-light text-dark">
            <h1 class="display-5"><i class="fa-solid fa-cart-plus"></i> Vender Vehiculo</h1>
        </div>
        
        <form action="" method="post" id="updatedForm">
            <input type="hidden" name="Carid" id="id" value="${id}">

            <label for="email" class="form-label">Comprador</label>
            <input type="email" class="form-control" name="email" id="emailComprador" required ><br>

            <button type="button" class="btn btn-outline-primary" 
                onclick="venderVehiculo('${id}')">Vender
            </button>
        </form>
        </div>`;
    }
    document.getElementById("contentModal").innerHTML = cadena;
    var myModal = new bootstrap.Modal(document.getElementById('modalUsuario'))
    myModal.toggle();

}

function venderVehiculo(id) {
    validaToken();
    var email = document.getElementById("emailComprador").value;

    fetch(urlApi + "/user/email/" + email, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': localStorage.token
        },
    })
        .then(response => response.json())
        .then((response) => {
            if (response.data.id) {
                fetch(urlApi + "/saveVehiclesUser", {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.token
                    },
                    body: JSON.stringify({
                        vehiclesId: {
                            id: id
                        },
                        userId: {
                            id: response.data.id
                        }
                    }),
                })
                    .then(response => response.json())
                    .then((response) => {
                        if (response.status == 201) {
                            fetch(urlApi + "/updateCarAvailability/" + id, {
                                method: 'PUT',
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json',
                                    'Authorization': localStorage.token
                                },
                            }).then(response => response.json())
                                .then((response) => {
                                    if (response.status == 200) {
                                        alertas("Vehiculo vendido correctamente!", 1);
                                        document.getElementById("contentModal").innerHTML = '';
                                        var myModalEl = document.getElementById('modalUsuario')
                                        var modal = bootstrap.Modal.getInstance(myModalEl) // Returns a Bootstrap modal instance
                                        modal.hide();
                                        listarVehiculos();
                                    } else {
                                        alertas("Ocurrio un error!", 0);
                                        document.getElementById("contentModal").innerHTML = '';
                                        var myModalEl = document.getElementById('modalUsuario')
                                        var modal = bootstrap.Modal.getInstance(myModalEl) // Returns a Bootstrap modal instance
                                        modal.hide();
                                    }
                                })
                        } else {
                            alertas("Ocurrio un error!", 0);
                            document.getElementById("contentModal").innerHTML = '';
                            var myModalEl = document.getElementById('modalUsuario')
                            var modal = bootstrap.Modal.getInstance(myModalEl) // Returns a Bootstrap modal instance
                            modal.hide();
                        }
                    })
            } else {
                alertas("El email no existe!", 0);
                document.getElementById("contentModal").innerHTML = '';
                var myModalEl = document.getElementById('modalUsuario')
                var modal = bootstrap.Modal.getInstance(myModalEl) // Returns a Bootstrap modal instance
                modal.hide();
            }
        });

    listarVehiculos();



}

function VehiculoNoDisponible() {
    alertas("Este Vehiculo no esta disponible para la venta!", 0);
}

function verVehiculo(id) {
    validaToken();
    var settings = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': localStorage.token
        },
    }
    fetch(urlApi + "/vehicles/" + id, settings)
        .then(response => response.json())
        .then((vehiculo) => {
            var cadvehiculo
            if (vehiculo) {
                cadena = `
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Gestion de vehiculos</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" >
                    <div class="p-3 mb-2 bg-light text-dark">
                        <h1 class="display-5"><i class="fa-solid fa-car"></i> Visualizar Vehiculo</h1>
                    </div>
                    <ul class="list-group">
                        <li class="list-group-item">Marca: ${vehiculo.car}</li>
                        <li class="list-group-item">Modelo: ${vehiculo.car_model}</li>
                        <li class="list-group-item">Color: ${vehiculo.car_color}</li>
                        <li class="list-group-item">Año: ${vehiculo.car_model_year}</li>
                        <li class="list-group-item">Placa: ${vehiculo.car_vin}</li>
                        <li class="list-group-item">Precio: ${vehiculo.price}</li>
                    </ul>
                </div>`;



            }
            document.getElementById("contentModal").innerHTML = cadena;
            var myModal = new bootstrap.Modal(document.getElementById('modalUsuario'))
            myModal.toggle();
        })
}

function verModificarVehiculo(id) {
    validaToken();
    var settings = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': localStorage.token
        },
    }
    fetch(urlApi + "/vehicles/" + id, settings)
        .then(response => response.json())
        .then((vehiculo) => {
            var cadena = '';
            if (vehiculo) {
                cadena = `
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Gestion de Vehiculos</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" >
                <div class="p-3 mb-2 bg-light text-dark">
                    <h1 class="display-5"><i class="fa-solid fa-car"></i> Modificar Vehiculo</h1>
                </div>
              
                <form action="" method="post" id="updatedForm">
                    <input type="hidden" name="id" id="id" value="${vehiculo.id}">

                    <label for="car" class="form-label">Marca</label>
                    <input type="text" class="form-control" name="car" id="car" required value="${vehiculo.car}"> <br>

                    <label for="car_model"  class="form-label">Modelo</label>
                    <input type="text" class="form-control" name="car_model" id="car_model" required value="${vehiculo.car_model}"> <br>

                    <label for="car_color" class="form-label">Color</label>
                    <input type="text" class="form-control" name="car_color" id="car_color" required value="${vehiculo.car_color}"> <br>

                    <label for="car_model_year" class="form-label">Año</label>
                    <input type="text" class="form-control" id="car_model_year" name="car_model_year" required value="${vehiculo.car_model_year}"> 

                    <label for="car_vin" class="form-label">Placa</label>
                    <input type="text" class="form-control" id="car_vin" name="car_vin" required value="${vehiculo.car_vin}"> 

                    <label for="price" class="form-label">Precio</label>
                    <input type="text" class="form-control" id="price" name="price" required value="${vehiculo.price}">
                    
                    <label for="availability" class="form-label" ${vehiculo.availability ? null : 'hidden'}>Availability</label>
                    <select id="availability" name="availability" class="form-select" aria-label="Default select example" ${vehiculo.availability ? null : 'hidden'}>
                        <option ${vehiculo.availability ? 'selected' : null} value="true">Disponible</option>
                        <option ${vehiculo.availability ? null : 'selected'} value="false">No Disponible</option>
                    </select>

                    <br>

                    <button type="button" class="btn btn-outline-warning" 
                        onclick="modificarVehiculo('${vehiculo.id}')">Modificar
                    </button>
                </form>
                </div>`;
            }
            document.getElementById("contentModal").innerHTML = cadena;
            var myModal = new bootstrap.Modal(document.getElementById('modalUsuario'))
            myModal.toggle();
        })
}

async function modificarVehiculo(id) {
    validaToken();
    var myForm = document.getElementById("updatedForm");
    var formData = new FormData(myForm);
    var jsonData = {};
    for (var [k, v] of formData) {//convertimos los datos a json
        jsonData[k] = v;
    }
    await fetch(urlApi + "/updateCar/" + id, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': localStorage.token
        },
        body: JSON.stringify(jsonData)
    });
    listarVehiculos();
    alertas("Se ha modificado el vehiculo exitosamente!", 1)
    document.getElementById("contentModal").innerHTML = '';
    var myModalEl = document.getElementById('modalUsuario')
    var modal = bootstrap.Modal.getInstance(myModalEl) // Returns a Bootstrap modal instance
    modal.hide();
}

function eliminaUsuario(id) {
    validaToken();
    var settings = {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': localStorage.token
        },
    }
    fetch(urlApi + "/api/users/" + id, settings)
        .then(response => response.json())
        .then(function (data) {
            listar();
            alertas("Se ha eliminado el usuario exitosamente!", 2)
        })
}

function verModificarUsuario(id) {
    validaToken();
    var settings = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': localStorage.token
        },
    }
    fetch(urlApi + "/user/" + id, settings)
        .then(response => response.json())
        .then((response) => {
            var cadena = '';
            usuario = response.data;
            if (usuario) {
                cadena = `
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Gestion de usuarios</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" >
                <div class="p-3 mb-2 bg-light text-dark">
                    <h1 class="display-5"><i class="fa-solid fa-user-pen"></i> Modificar Usuario</h1>
                </div>
              
                <form action="" method="post" id="updatedForm">
                    <input type="hidden" name="id" id="id" value="${usuario.id}">
                    <label for="firstName" class="form-label">First Name</label>
                    <input type="text" class="form-control" name="firstName" id="firstName" required value="${usuario.firstName}"> <br>
                    <label for="lastName"  class="form-label">Last Name</label>
                    <input type="text" class="form-control" name="lastName" id="lastName" required value="${usuario.lastName}"> <br>
                    <label for="email" class="form-label">Email</label>
                    <input type="email" class="form-control" name="email" id="email" required value="${usuario.email}"> <br>
                    <label for="password" class="form-label">Password</label>
                    <input type="password" class="form-control" id="password" name="password" required> <br>
                    <button type="button" class="btn btn-outline-warning" 
                        onclick="modificarUsuario('${usuario.id}')">Modificar
                    </button>
                </form>
                </div>`;
            }
            document.getElementById("contentModal").innerHTML = cadena;
            var myModal = new bootstrap.Modal(document.getElementById('modalUsuario'))
            myModal.toggle();
        })
}

async function modificarUsuario(id) {
    validaToken();
    var myForm = document.getElementById("updatedForm");
    var formData = new FormData(myForm);
    var jsonData = {};
    for (var [k, v] of formData) {//convertimos los datos a json
        jsonData[k] = v;
    }
    await fetch(urlApi + "/user/" + id, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': localStorage.token
        },
        body: JSON.stringify(jsonData)
    });
    listar();
    alertas("Se ha modificado el usuario exitosamente!", 1)
    document.getElementById("contentModal").innerHTML = '';
    var myModalEl = document.getElementById('modalUsuario')
    var modal = bootstrap.Modal.getInstance(myModalEl) // Returns a Bootstrap modal instance
    modal.hide();
}

function verUsuario(id) {
    validaToken();
    var settings = {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': localStorage.token
        },
    }
    fetch(urlApi + "/user/" + id, settings)
        .then(response => response.json())
        .then((response) => {
            usuario = response.data;
            var cadena = '';
            if (usuario) {
                cadena = `
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Gestion de usuarios</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" >
                    <div class="p-3 mb-2 bg-light text-dark">
                        <h1 class="display-5"><i class="fa-solid fa-user"></i> Visualizar Usuario</h1>
                    </div>
                    <ul class="list-group">
                        <li class="list-group-item">Nombre: ${usuario.firstName}</li>
                        <li class="list-group-item">Apellido: ${usuario.lastName}</li>
                        <li class="list-group-item">Correo: ${usuario.email}</li>
                    </ul>
                </div>`;

            }
            document.getElementById("contentModal").innerHTML = cadena;
            var myModal = new bootstrap.Modal(document.getElementById('modalUsuario'))
            myModal.toggle();
        })
}

function alertas(mensaje, tipo) {
    var color = "";
    if (tipo == 1) {//success verde
        color = "success"
    }
    else {//danger rojo
        color = "danger"
    }
    var alerta = `<div class="alert alert-${color} alert-dismissible fade show" role="alert">
                    <strong><i class="fa-solid fa-triangle-exclamation"></i></strong>
                        ${mensaje}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                 </div>`;
    document.getElementById("datos").innerHTML = alerta;
}
function userRegister() {
    cadena = `
            <div class="modal-header">
                <h1 class="display-5"><i class="fa-solid fa-user-plus"></i> Registrar Usuario</h1>
            </div>
            <div class="modal-body" > 
                <form action="" method="post" id="myFormRegister">
                    <input type="hidden" name="id" id="id">
                    <label for="firstName" class="form-label">First Name</label>
                    <input type="text" class="form-control" name="firstName" id="firstName" required> <br>
                    <label for="lastName"  class="form-label">Last Name</label>
                    <input type="text" class="form-control" name="lastName" id="lastName" required> <br>
                    <label for="email" class="form-label">Email</label>
                    <input type="email" class="form-control" name="email" id="email" required> <br>
                    <label for="password" class="form-label">Password</label>
                    <input type="password" class="form-control" id="password" name="password" required> <br>
                    <button type="button" class="btn btn-outline-info" onclick="registrarUsuario()">Registrar</button>
                </form>
            </div>`;
    document.getElementById("contentModal").innerHTML = cadena;
    var myModal = new bootstrap.Modal(document.getElementById('modalUsuario'))
    myModal.toggle();
}

async function registrarUsuario() {
    var myForm = document.getElementById("myFormRegister");
    var formData = new FormData(myForm);
    var jsonData = {};
    for (var [k, v] of formData) {//convertimos los datos a json
        jsonData[k] = v;
    }
    const request = await fetch(urlApi + "/user", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData)
    });
    listar();
    alertas("Se ha registrado el usuario exitosamente!", 1)
    document.getElementById("contentModal").innerHTML = '';
    var myModalEl = document.getElementById('modalUsuario')
    var modal = bootstrap.Modal.getInstance(myModalEl) // Returns a Bootstrap modal instance
    modal.hide();
}

 function register() {
    var myForm = document.getElementById("myFormRegister");
    var formData = new FormData(myForm);
    var jsonData = {};
    for (var [k, v] of formData) {//convertimos los datos a json
        jsonData[k] = v;
    }
   fetch(urlApi + "/user", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData)
    }).then((response)=>response.json())
    .then(response=>{
        if(response.message=="Registro creado"){
            Swal.fire({
                icon: 'success',
                title: 'Usuario resgistrado',
                showConfirmButton: false,
                timer: 1500
            }).then(result=>{
                window.location="index.html";
            })
        }
    })
    
}



function modalConfirmacion(texto, funcion) {
    document.getElementById("contenidoConfirmacion").innerHTML = texto;
    var myModal = new bootstrap.Modal(document.getElementById('modalConfirmacion'))
    myModal.toggle();
    var confirmar = document.getElementById("confirmar");
    confirmar.onclick = funcion;
}

function salir() {
    localStorage.clear();
    location.href = "index.html";
}

function validaToken() {
    if (localStorage.token == undefined) {
        salir();
    }
}

function voltear() {
    const tarjeta = document.querySelector('#tarjeta');

    // * Volteamos la tarjeta para mostrar el frente.
    const mostrarFrente = () => {
        if (tarjeta.classList.contains('active')) {
            tarjeta.classList.remove('active');
        }
    }

    // * Rotacion de la tarjeta
    tarjeta.addEventListener('click', () => {
        tarjeta.classList.toggle('active');
    });
}