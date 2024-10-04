<template>
  <div class="wrapper vh-100">
    <div class="row align-items-center h-100">
      <form class="col-lg-6 col-md-8 col-10 mx-auto">
        <div class="mx-auto text-center my-4">
          <div class="w-100 mb-4 d-flex logo-container">
            <a class="navbar-brand mx-auto mt-2 flex-fill text-center logo-link" href="#">
              AKANJO MAINTENANCE
            </a>
          </div>
          <h2 class="my-3">Inscription</h2>
        </div>

        <div class="form-group">
          <label for="username">Votre nom</label>
          <input type="text" id="username" class="form-control" />
        </div>

        <div class="form-group">
          <label for="inputEmail4">Email</label>
          <input type="email" class="form-control" id="inputEmail4" />
        </div>

        <hr class="my-4" />
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="form-group">
              <label for="inputPassword5">Votre mot de passe</label>
              <input type="password" class="form-control" id="inputPassword5" />
            </div>
            <div class="form-group">
              <label for="inputPassword6">Confirmer votre mot de passe</label>
              <input type="password" class="form-control" id="inputPassword6" />
            </div>
          </div>

          <div class="col-md-6 mb-20 role">
            <div class="card shadow">
              <div class="card-body">
                <p class="mb-2"><strong>Votre role</strong></p>
                <div class="custom-control custom-radio">
                  <input
                    type="radio"
                    id="customRadio1"
                    name="customRadio"
                    class="custom-control-input"
                  />
                  <label class="custom-control-label" for="customRadio1"
                    >Responsable</label
                  >
                </div>
                <div class="custom-control custom-radio">
                  <input
                    type="radio"
                    id="customRadio2"
                    name="customRadio"
                    class="custom-control-input"
                    checked
                  />
                  <label class="custom-control-label" for="customRadio2"
                    >Technicien</label
                  >
                </div>
                <div class="custom-control custom-radio">
                  <input
                    type="radio"
                    name="radioDisabled"
                    id="customRadioDisabled2"
                    class="custom-control-input"
                    disabled
                  />
                  <label class="custom-control-label" for="customRadioDisabled2"
                    >Chef</label
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <button class="btn btn-lg btn-primary btn-block" type="submit">Valider</button>
        <p class="mt-5 mb-3 text-muted text-center">© 2024</p>
      </form>
    </div>
  </div>
</template>

<style>
.logo-container {
  /* display: flex; */
  justify-content: center;
  align-items: center;
  height: 70px;
  background: linear-gradient(135deg, #1b68ff, #17a2b8);
  border-radius: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out;
}

.logo-container:hover {
  transform: scale(1.05); /* Agrandir légèrement au survol */
}

/* Lien du logo */
.logo-link {
  font-family: "Poppins", sans-serif;
  font-size: 14.5px;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 4px;
  text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
  position: relative;
  transition: color 0.3s ease-in-out, text-shadow 0.3s ease-in-out;
}

.logo-link::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 3px;
  bottom: -5px;
  left: 0;
  background-color: #fff;
  visibility: hidden;
  transform: scaleX(0);
  transition: all 0.3s ease-in-out;
}

.logo-link:hover {
  color: #ffc107;
  text-shadow: 2px 2px 15px rgba(255, 193, 7, 0.7);
}

.logo-link:hover::before {
  visibility: visible;
  transform: scaleX(1);
}

.role {
  margin-top: 3%;
}
</style>
