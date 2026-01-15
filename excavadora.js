// Pablo Benavente de Prada

// Variables globales
let scene, camera, renderer, controls;
let cubo;
let pivoteDelIzq, pivoteDelDer;
let chasis, baseGiratoria, cuerpoSuperior;
let articulacionHombro, articulacionCodo, cucharaGrupo;
const velocidad = 0.2;
const velocidadRotacion = 0.03;


function init() {



    // 1. ESCENA, FONDO Y NIEBLA (horizonte)
    scene = new THREE.Scene();
    const colorFondo = 0x87CEEB;
    scene.background = new THREE.Color(colorFondo);
    scene.fog = new THREE.Fog(colorFondo, 10, 80);



    // 2. CÁMARA, RENDERIZADOR Y CONTROLES
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.position.set(10, 10, 10);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 2.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.staticMoving = true;




    // 3. TEXTURAS
    const loader = new THREE.TextureLoader();

    // -- GRAVA (suelo) --

    let baseColor = loader.load('./texturas/SandyGravel01_2K_BaseColor.png');
    let normalMap = loader.load('./texturas/SandyGravel01_2K_Normal.png');
    let roughnessMap = loader.load('./texturas/SandyGravel01_2K_Roughness.png');

    mapas = [baseColor, normalMap, roughnessMap];
    // Hay que repetirla varias veces
    mapas.forEach(map => {
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(50, 50);
    });

    const matSueloGrava = new THREE.MeshStandardMaterial({
        map: baseColor,
        normalMap: normalMap,
        roughnessMap: roughnessMap,
        roughness: 0.8
    });

    // -- METAL AMARILLO SUCIO (cuerpo excavadora y brazo) --

    baseColor = loader.load('./texturas/PaintedMetal03_4K_BaseColor.png');
    normalMap = loader.load('./texturas/PaintedMetal03_4K_Normal.png');
    roughnessMap = loader.load('./texturas/PaintedMetal03_4K_Roughness.png');
    let metallicMap = loader.load('./texturas/PaintedMetal03_4K_Metallic.png');
    let aoMap = loader.load('./texturas/PaintedMetal03_4K_AO.png');
    let bumpMap = loader.load('./texturas/PaintedMetal03_4K_Height.png');

    const matMetalExca = new THREE.MeshStandardMaterial({
        map: baseColor,
        normalMap: normalMap,
        roughnessMap: roughnessMap,
        metalnessMap: metallicMap,
        aoMap: aoMap,
        bumpMap: bumpMap
    });

    // -- NEUMÁTICO (ruedas) --

    baseColor = loader.load('./texturas/striped-black-wallpaper.jpg');
    const matNeumatico = new THREE.MeshStandardMaterial({map: baseColor});

    // -- METAL GRIS (chasis y guardabarros) --

    baseColor = loader.load('./texturas/metal_7761.jpg');
    const matChasis = new THREE.MeshStandardMaterial({map: baseColor, side: THREE.DoubleSide});

    // -- METAL REJILLA --

    baseColor = loader.load('./texturas/metal_treadplate-color.png');
    const matRejilla = new THREE.MeshStandardMaterial({map: baseColor});




    // 4. MATERIALES (no texturas)

    // -- METAL NEGRO (parte del cuerpo y brazo de la excavadora, cuchara incluida) --
    
    const matNegroMec = new THREE.MeshStandardMaterial({
        color: 0x111111,
        side: THREE.DoubleSide,
        metalness: 0.7,
        roughness: 0.4
    });

    // -- METAL LLANTAS --
    
    const matLlanta = new THREE.MeshPhongMaterial({ color: 0xdddddd, shininess: 60 });




    // 5. SUELO

    const geoSuelo = new THREE.PlaneGeometry(500, 500);
    const suelo = new THREE.Mesh(geoSuelo, matSueloGrava);
    suelo.rotation.x = -Math.PI / 2;
    scene.add(suelo);






    // 6. ESTRUCTURA: CHASIS DE VIGAS, EJES, RUEDAS Y CUERPO


    // --- 6.1 VIGA CENTRAL Y EJES ---

    // Viga central
    const geoViga = new THREE.BoxGeometry(2.5, 1.0, 4.5);
    chasis = new THREE.Mesh(geoViga, matChasis);
    chasis.position.set(0, 1.0, 0);
    scene.add(chasis);

    // Ejes transversales (donde se enganchan las ruedas)
    const geoEjeRuedas = new THREE.BoxGeometry(4.0, 0.4, 0.4);
    const ejeDel = new THREE.Mesh(geoEjeRuedas, matChasis);
    ejeDel.position.z = -1.6;
    chasis.add(ejeDel);

    const ejeTras = new THREE.Mesh(geoEjeRuedas, matChasis);
    ejeTras.position.z = 1.6;
    chasis.add(ejeTras);

    
    // --- 6.2 GUARDABARROS ---

    // Soportes guardabarros
    const geoSoporGuardabarros = new THREE.BoxGeometry(5.0, 0.2, 0.8);
    const SopGuardabarros = new THREE.Mesh(geoSoporGuardabarros, matChasis);
    SopGuardabarros.position.y = 0.1;
    chasis.add(SopGuardabarros);

    const geoGuardabarros = new THREE.CylinderGeometry(1.2, 1.2, 0.85, 20, 10, true, 0, Math.PI);

    function crearGuardabarros(x, z) {
        const g = new THREE.Mesh(geoGuardabarros, matChasis);
        g.position.set(x, 0.0, z);
        g.rotation.z = - Math.PI / 2;
        g.rotation.x = Math.PI;
        return g;
    }

    chasis.add(crearGuardabarros(2.1, -1.6));  // Del-Izq
    chasis.add(crearGuardabarros(-2.1, -1.6)); // Del-Der
    chasis.add(crearGuardabarros(2.1, 1.6));   // Tras-Izq
    chasis.add(crearGuardabarros(-2.1, 1.6));  // Tras-Der


    // --- 6.3 BASE GIRATORIA (sobre la viga, conexión con cuerpo superior) ---

    const geoBase = new THREE.CylinderGeometry(1.2, 1.2, 1.5, 24);
    baseGiratoria = new THREE.Mesh(geoBase, matNegroMec);
    baseGiratoria.position.y = 0.5;
    chasis.add(baseGiratoria);


    // --- 6.4 CUERPO SUPERIOR (plataforma, compartimento motor y rejilla) ---

    cuerpoSuperior = new THREE.Group();
    cuerpoSuperior.position.y = 0.25;
    baseGiratoria.add(cuerpoSuperior);

    const geoPlataforma = new THREE.BoxGeometry(3.8, 0.5, 4.5);
    plataforma = new THREE.Mesh(geoPlataforma, matMetalExca);
    plataforma.position.y = 0.75;
    cuerpoSuperior.add(plataforma);

    const geoMotor = new THREE.BoxGeometry(3.81, 2.51, 2.01);
    const motor = new THREE.Mesh(geoMotor, matMetalExca);
    motor.position.set(0, 1.75, 1.25);
    cuerpoSuperior.add(motor);

    const geoRejilla = new THREE.BoxGeometry(3.0, 0.8, 0.1);
    const rejilla = new THREE.Mesh(geoRejilla, matRejilla);
    rejilla.position.set(0, 1.4, 2.26);
    cuerpoSuperior.add(rejilla);


    // --- 6.5 RUEDAS ---
    
    const shape = new THREE.Shape();
    shape.absarc(0, 0, 1.0, 0, Math.PI * 2, false);
    const hueco = new THREE.Path();
    hueco.absarc(0, 0, 0.6, 0, Math.PI * 2, true);
    shape.holes.push(hueco);

    const geoNeumatico = new THREE.ExtrudeGeometry(shape, { depth: 0.7, bevelEnabled: false, curveSegments: 24 });
    geoNeumatico.center();
    const geoLlanta = new THREE.CylinderGeometry(0.6, 0.6, 0.4, 24);

    function crearRueda(x, y, z) {
        const grupoRueda = new THREE.Group();
        const neumatico = new THREE.Mesh(geoNeumatico, matNeumatico);
        neumatico.rotation.y = Math.PI / 2;
        grupoRueda.add(neumatico);
        const llanta = new THREE.Mesh(geoLlanta, matLlanta);
        llanta.rotation.z = Math.PI / 2;
        grupoRueda.add(llanta);
        grupoRueda.position.set(x, y, z);
        return grupoRueda;
    }

    function crearRuedaConDireccion(x, y, z) {
        const pivote = new THREE.Group();
        pivote.position.set(x, y, z);
        pivote.add(crearRueda(0, 0, 0));
        return pivote;
    }

    // Extremos de los ejes del chasis
    const offX = 2.1;
    const offZ = 1.6;
    const offY = 0.0;

    pivoteDelIzq = crearRuedaConDireccion(offX, offY, -offZ);
    pivoteDelDer = crearRuedaConDireccion(-offX, offY, -offZ);
    const ruedaTraseraIzq = crearRueda(offX, offY, offZ);
    const ruedaTraseraDer = crearRueda(-offX, offY, offZ);

    chasis.add(pivoteDelIzq, pivoteDelDer, ruedaTraseraIzq, ruedaTraseraDer);
    




    // 7. ESTRUCTURA: CABINA, PUERTA, BRAZO Y CUCHARA

    // --- 7.1 CABINA ---
    const geoCabina = new THREE.BoxGeometry(1.5, 2.4, 2.3);
    const matCabina = new THREE.MeshPhongMaterial({ color: 0x333333, transparent: true, opacity: 0.7 }); // Simula cristal
    const cabina = new THREE.Mesh(geoCabina, matCabina);
    cabina.position.set(1.1, 1.75, -0.8);
    cuerpoSuperior.add(cabina);


    // --- 7.2 PUERTA ---
    const grupoPuerta = new THREE.Group();
    grupoPuerta.position.set(1.1 + 0.76, 1.9, -0.3);
    cuerpoSuperior.add(grupoPuerta);

    const marcoPuerta = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 2.3, 1.1),
        matNegroMec
    );
    grupoPuerta.add(marcoPuerta);

    const cristalPuerta = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 2.1, 0.9),
        new THREE.MeshPhongMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0.5
        })
    );
    grupoPuerta.add(cristalPuerta);

    const manivela = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.05, 0.2),
        new THREE.MeshPhongMaterial({ color: 0xaaaaaa })
    );
    manivela.position.set(0.0, -0.2, 0.4);
    grupoPuerta.add(manivela);


    // --- 7.3 BASE CILÍNDRICA (del brazo) ---
    const geoBaseBrazo = new THREE.CylinderGeometry(0.7, 1.1, 0.4, 20);
    baseBrazo = new THREE.Mesh(geoBaseBrazo, matNegroMec);
    baseBrazo.position.set(-0.8, 1.1, -1.15);
    cuerpoSuperior.add(baseBrazo);


    // --- 7.4 BRAZO Y PERNOS ---    
    const largoBrazo1 = 5.0;
    const largoBrazo2 = 4.0;
    const anchoBrazo = 1.0;
    const radioPerno = 0.35;

    // Articulación hombro
    articulacionHombro = new THREE.Group();
    articulacionHombro.position.set(0, 0.3, 0);
    baseBrazo.add(articulacionHombro); 

    // Brazo 1
    const brazo1 = new THREE.Mesh(new THREE.BoxGeometry(anchoBrazo, largoBrazo1, 0.6), matMetalExca);
    brazo1.position.y = largoBrazo1 / 2;
    articulacionHombro.add(brazo1);
    articulacionHombro.rotation.x = -Math.PI / 4;

    // Codo
    articulacionCodo = new THREE.Group();
    articulacionCodo.position.y = largoBrazo1;
    articulacionHombro.add(articulacionCodo);

    // Brazo 2
    const brazo2 = new THREE.Mesh(new THREE.BoxGeometry(anchoBrazo - 0.2, largoBrazo2, 0.5), matMetalExca);
    brazo2.position.y = largoBrazo2 / 2;
    articulacionCodo.add(brazo2);
    articulacionCodo.rotation.x = -Math.PI / 2;

    // Perno del hombro
    const pernoHombro = new THREE.Mesh(new THREE.CylinderGeometry(radioPerno, radioPerno, anchoBrazo + 0.2, 20), matNegroMec);
    pernoHombro.rotation.z = Math.PI / 2;
    articulacionHombro.add(pernoHombro);
    // Perno del codo
    const pernoCodo = new THREE.Mesh(new THREE.CylinderGeometry(radioPerno, radioPerno, anchoBrazo + 0.2, 20), matNegroMec);
    pernoCodo.rotation.z = Math.PI / 2;
    articulacionCodo.add(pernoCodo);


    // --- 7.5 CUCHARA ---
    const anchoCucharaReal = 2.0;
    const radioCuchara = 0.8;

    cucharaGrupo = new THREE.Group();
    cucharaGrupo.position.y = largoBrazo2;
    articulacionCodo.add(cucharaGrupo);

    const pernoCuchara = new THREE.Mesh(new THREE.CylinderGeometry(radioPerno, radioPerno, anchoBrazo, 20), matNegroMec);
    pernoCuchara.rotation.z = Math.PI / 2;
    cucharaGrupo.add(pernoCuchara);

    const desplazadorCuchara = new THREE.Group();
    desplazadorCuchara.position.z = -radioCuchara;
    cucharaGrupo.add(desplazadorCuchara);

    const geoCuerpoCuchara = new THREE.CylinderGeometry(radioCuchara, radioCuchara, anchoCucharaReal, 20, 1, true, 0, Math.PI);
    const cuerpoCuchara = new THREE.Mesh(geoCuerpoCuchara, matNegroMec);
    cuerpoCuchara.rotation.z = Math.PI / 2;
    
    desplazadorCuchara.add(cuerpoCuchara);

    // Tapas de la cuchara
    const geoTapa = new THREE.CircleGeometry(radioCuchara, 20, 0, Math.PI);
    const tapaIzq = new THREE.Mesh(geoTapa, matNegroMec);
    tapaIzq.position.x = -anchoCucharaReal / 2;
    tapaIzq.rotation.y = -Math.PI / 2;
    desplazadorCuchara.add(tapaIzq);

    const tapaDer = new THREE.Mesh(geoTapa, matNegroMec);
    tapaDer.position.x = anchoCucharaReal / 2;
    tapaDer.rotation.y = Math.PI / 2;
    desplazadorCuchara.add(tapaDer);

    // Dientes de la cuchara
    const numDientes = 5;
    const radioDiente = 0.1;
    const alturaDiente = 0.4;
    const geoDiente = new THREE.ConeGeometry(radioDiente, alturaDiente, 4);

    for (let i = 0; i < numDientes; i++) {
        const diente = new THREE.Mesh(geoDiente, matNegroMec);
        const xPos = (i / (numDientes - 1)) * (anchoCucharaReal-0.2) - ((anchoCucharaReal-0.2) / 2);
        diente.position.set(xPos, 0.1, -radioCuchara-0.2);
        diente.rotation.x = -Math.PI / 2;
        desplazadorCuchara.add(diente);
    }

    cucharaGrupo.rotation.x = Math.PI / 6;






    // 8. SUPERESTRUCTURA Y DETALLES (Techo, Pasarela, Escape, Escalerilla y Faro)


    // --- 8.1 TECHO UNIFICADO ---
    const geoTechoMotor = new THREE.BoxGeometry(3.9, 0.2, 2.1);
    const techoMotor = new THREE.Mesh(geoTechoMotor, matNegroMec);
    techoMotor.position.set(0, 3.05, 1.25);
    cuerpoSuperior.add(techoMotor);

    const geoTechoCabina = new THREE.BoxGeometry(1.7, 0.2, 2.4);
    const techoCabina = new THREE.Mesh(geoTechoCabina, matNegroMec);
    techoCabina.position.set(1.1, 3.05, -0.8);
    cuerpoSuperior.add(techoCabina);


    // --- 8.2 PASARELA LATERAL ---
    const geoPasarela = new THREE.BoxGeometry(0.8, 0.18, 4.3);
    const pasarela = new THREE.Mesh(geoPasarela, matRejilla);
    pasarela.position.set(2.1, 0.55, -0.09);
    cuerpoSuperior.add(pasarela);


    // --- 8.3 TUBO DE ESCAPE ---
    const grupoEscape = new THREE.Group();
    grupoEscape.position.set(-1.2, 3.0, 1.5);
    cuerpoSuperior.add(grupoEscape);

    const escapeVertical = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 1.2, 12),
        matNegroMec
    );
    grupoEscape.add(escapeVertical);

    const escapePunta = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.4, 12),
        matNegroMec
    );
    escapePunta.position.set(0, 0.6, 0.1);
    escapePunta.rotation.x = Math.PI / 4;
    grupoEscape.add(escapePunta);


    // --- 8.4 ESCALERILLA ---
    const geoSoporEscalerilla = new THREE.BoxGeometry(0.2, 1.5, 0.8);
    const SopEscalerilla = new THREE.Mesh(geoSoporEscalerilla, matChasis);
    SopEscalerilla.position.x = 2.5;
    SopEscalerilla.position.y = 0.4;
    chasis.add(SopEscalerilla);

    const geoEscalon1 = new THREE.BoxGeometry(0.6, 0.1, 0.8);
    const escalon1 = new THREE.Mesh(geoEscalon1, matChasis);
    escalon1.position.x = 2.7;
    escalon1.position.y = -0.4;
    chasis.add(escalon1);
    
    const geoEscalon2 = new THREE.BoxGeometry(0.5, 0.1, 0.8);
    const escalon2 = new THREE.Mesh(geoEscalon2, matChasis);
    escalon2.position.x = 2.7;
    escalon2.position.y = 0.0;
    chasis.add(escalon2);
    
    const geoEscalon3 = new THREE.BoxGeometry(0.4, 0.1, 0.8);
    const escalon3 = new THREE.Mesh(geoEscalon3, matChasis);
    escalon3.position.x = 2.7;
    escalon3.position.y = 0.4;
    chasis.add(escalon3);

    const geoEscalon4 = new THREE.BoxGeometry(0.3, 0.1, 0.8);
    const escalon4 = new THREE.Mesh(geoEscalon4, matChasis);
    escalon4.position.x = 2.7;
    escalon4.position.y = 0.8;
    chasis.add(escalon4);


    // --- 8.5 FARO ---
    const grupoFaro = new THREE.Group();
    grupoFaro.position.set(1.1, 3.15, -1.9);
    cuerpoSuperior.add(grupoFaro);

    const carcasaFaro = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.3, 0.2),
        matNegroMec
    );
    grupoFaro.add(carcasaFaro);

    const cristalFaro = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.2, 0.05),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    cristalFaro.position.z = -0.11;
    grupoFaro.add(cristalFaro);







    // 9. ILUMINACIÓN

    // --- 9.1 LUZ AMBIENTAL ---    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);


    // --- 9.2 LUZ DIRECCIONAL (sol) ---
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);


    // --- 9.3 LUZ DE FARO ---
    const luzTecnica = new THREE.SpotLight(0xffffff, 10);
    luzTecnica.position.set(0, 0, -0.1);
    luzTecnica.angle = Math.PI / 4;
    luzTecnica.penumbra = 0.3;
    luzTecnica.decay = 2;
    luzTecnica.distance = 25;
    grupoFaro.add(luzTecnica);

    const objetivoLuz = new THREE.Object3D(); // donde tiene que apuntar el faro
    objetivoLuz.position.set(0, -1, -10);
    grupoFaro.add(objetivoLuz);
    luzTecnica.target = objetivoLuz;





    // 10. HABILITAR MOVIMIENTO POR TECLAS
    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (teclas.hasOwnProperty(key)) teclas[key] = true;
    });

    window.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (teclas.hasOwnProperty(key)) teclas[key] = false;
    });
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    controls.handleResize();
}


// MOVIMIENTO POR TECLAS Y ANIMATE


const teclas = { 
    w: false, s: false, a: false, d: false, // Movimiento de conducción
    q: false, e: false, // Rotación base
    z: false, c: false, // Hombro y
    r: false, f: false, // Hombro x
    t: false, g: false, // Codo
    y: false, h: false  // Cuchara
};

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    if (chasis) {
        let multiplicadorGiro = 1; // Para que funcione como lo haría un vehículo
        if (teclas.s) multiplicadorGiro = -1;
        let giroRuedasObjetivo = 0;

        // Movimiento de conducción
        if (teclas.a) {
            chasis.rotation.y += velocidadRotacion * multiplicadorGiro;
            giroRuedasObjetivo = 0.4;
        }
        if (teclas.d) {
            chasis.rotation.y -= velocidadRotacion * multiplicadorGiro;
            giroRuedasObjetivo = -0.4;
        }

        pivoteDelIzq.rotation.y += (giroRuedasObjetivo - pivoteDelIzq.rotation.y) * 0.1;
        pivoteDelDer.rotation.y += (giroRuedasObjetivo - pivoteDelDer.rotation.y) * 0.1;

        if (teclas.w) chasis.translateZ(-velocidad);
        if (teclas.s) chasis.translateZ(velocidad);


        // Rotación de cuerpo respecto a chasis (Q/E)
        if (teclas.q) baseGiratoria.rotation.y += 0.02;
        if (teclas.e) baseGiratoria.rotation.y -= 0.02;


        const vArt = 0.02; // Velocidad de articulación

        // Control del Hombro (Z/C) eje Y
        if (teclas.z) baseBrazo.rotation.y += vArt;
        if (teclas.c) baseBrazo.rotation.y -= vArt;


        // Control del Hombro (R/F) eje X
        if (teclas.r) articulacionHombro.rotation.x += vArt;
        if (teclas.f) articulacionHombro.rotation.x -= vArt;


        // Control del Codo (T/G)
        if (teclas.t) articulacionCodo.rotation.x += vArt;
        if (teclas.g) articulacionCodo.rotation.x -= vArt;


        // Control de la Cuchara (Y/H)
        if (teclas.y) cucharaGrupo.rotation.x += vArt;
        if (teclas.h) cucharaGrupo.rotation.x -= vArt;
        

        // LIMITES PARA EVITAR COLISIONES (aunque no cuentan con cambios en rotación del cuerpo superior ni con el suelo)
        baseBrazo.rotation.y = Math.max(-0.4, Math.min(1.8, baseBrazo.rotation.y));
        articulacionHombro.rotation.x = Math.max(-1.5, Math.min(0.2, articulacionHombro.rotation.x));
        articulacionCodo.rotation.x = Math.max(-2.2, Math.min(1, articulacionCodo.rotation.x));
        cucharaGrupo.rotation.x = Math.max(0.0, Math.min(2.5, cucharaGrupo.rotation.x));
    }

    camera.up.set(0, 1, 0);
    if (camera.position.y < 0.5) camera.position.y = 0.5;

    renderer.render(scene, camera);
}

init();
animate();