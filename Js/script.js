// Rastgele mağaza verisini almak
async function getRandomStoreData() {
    try {
        const response = await fetch('../JSON/storename.json');
        const stores = await response.json();
        const randomStore = stores[Math.floor(Math.random() * stores.length)];
        
        // HTML elemanlarını güncelle
        updateStoreInfo(randomStore);
    } catch (error) {
        console.error("JSON verisi alınamadı:", error);
    }
}

// Mağaza bilgilerini HTML'e ekleme
function updateStoreInfo(store) {
    document.querySelector('.m-name').textContent = store.name;
    document.querySelector('.m-adres').textContent = store.address;
    document.querySelector('.city').textContent = store.city;
    document.querySelector('.tel').textContent = store.phone_number;
}

// Rastgele MERSIS numarası üretme
function generateRandomMersisNo() {
    let mersisNo = '';
    for (let i = 0; i < 16; i++) {
        mersisNo += Math.floor(Math.random() * 10);
    }
    return mersisNo;
}

// MERSIS numarasını HTML'e ekleme
function updateMersisNo() {
    const mersisNoElement = document.querySelector('.m-mersisno p');
    mersisNoElement.textContent = generateRandomMersisNo();
}

// Rastgele tarih ve saat üretme
function generateRandomDateTime() {
    const now = new Date();
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(now.getMonth() - 2);
    const randomTimestamp = twoMonthsAgo.getTime() + Math.random() * (now.getTime() - twoMonthsAgo.getTime());
    const randomDate = new Date(randomTimestamp);

    const day = String(randomDate.getDate()).padStart(2, '0');
    const month = String(randomDate.getMonth() + 1).padStart(2, '0');
    const year = randomDate.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    const randomHour = Math.floor(Math.random() * (22 - 9 + 1)) + 9;
    const randomMinutes = Math.floor(Math.random() * 60);
    const hours = String(randomHour).padStart(2, '0');
    const minutes = String(randomMinutes).padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;

    return { formattedDate, formattedTime };
}

// Fiş numarasını rastgele oluşturma
function generateRandomFisNo() {
    return Math.floor(Math.random() * 500) + 1;
}

// Fiş bilgilerini HTML'e ekleme
function updateDateTimeFis() {
    const { formattedDate, formattedTime } = generateRandomDateTime();
    const randomFisNo = generateRandomFisNo();

    document.querySelector('.hist').textContent = `TARİH: ${formattedDate}`;
    document.querySelector('.clock').textContent = `SAAT: ${formattedTime}`;
    document.querySelector('.m-fisno p').textContent = randomFisNo;
}

// Rastgele ürünleri seçme
function getRandomProducts(products, min, max) {
    const numProducts = Math.floor(Math.random() * (max - min + 1)) + min;
    const randomProducts = [];
    while (randomProducts.length < numProducts) {
        const randomIndex = Math.floor(Math.random() * products.length);
        const product = products[randomIndex];
        if (!randomProducts.includes(product)) {
            randomProducts.push(product);
        }
    }
    return randomProducts;
}

// Ürünleri HTML'e ekleme
function updateProducts(products) {
    const productContainer = document.querySelector('.m-product-main');
    productContainer.innerHTML = '';

    let totalPrice = 0;
    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('m-product');

        const productNameDiv = document.createElement('div');
        productNameDiv.classList.add('m-product-name');
        const productNameP = document.createElement('p');
        productNameP.textContent = 'Organik ' + product.name;
        productNameDiv.appendChild(productNameP);

        const productPriceDiv = document.createElement('div');
        productPriceDiv.classList.add('m-price');
        productPriceDiv.style.display = 'flex';
        const productPriceP = document.createElement('p');

        const price = parseFloat(product.discounted_price);
        productPriceP.textContent = `* ${price.toFixed(2)}`;
        productPriceDiv.appendChild(productPriceP);

        productDiv.appendChild(productNameDiv);
        productDiv.appendChild(productPriceDiv);
        productContainer.appendChild(productDiv);

        totalPrice += price;
    });

    document.querySelector('.m-total-price p').textContent = `* ${totalPrice.toFixed(2)}`;
}

// Kart numarası oluşturma
function generateCardNumber() {
    const firstPart = Math.floor(Math.random() * 900000 + 100000);  // 6 haneli bir sayı üret
    const lastPart = Math.floor(Math.random() * 10000 + 1000);  // 4 haneli bir sayı üret
    return [firstPart, lastPart];
}

// Kart numarasını HTML'e ekleme
function updateCardNumber() {
    const cardNumberElement = document.querySelector('.m-card-number');
    const cardNumber = generateCardNumber();
    cardNumberElement.innerHTML = ` 
        <p>${cardNumber[0]}</p>
        <p class="hidden">******</p>
        <p>${cardNumber[1]}</p>
    `;
}

// Barkod oluşturma ve HTML'e ekleme
function generateBarcode(mersisNo, formattedDate, formattedTime, totalPrice) {
    const barcodeContainer = document.querySelector(".m-br-box"); // Barkodun konulacağı div
    const barcodeNumberContainer = document.querySelector(".m-br-number"); // Barkod numarasının yazılacağı div

    // Barkod numarasını oluşturuyoruz
    const barcodeValue = `${mersisNo}${formattedDate.replace(/\//g, '')}${formattedTime.replace(":", "")}${Math.floor(totalPrice)}`;

    // JsBarcode ile barkod oluşturma
    JsBarcode(barcodeContainer, barcodeValue, {
        format: "EAN13",  // Barkod türü
        width: 3,         // Barkod çizgilerinin genişliği
        height: 100,      // Barkod yüksekliği
        displayValue: false // Barkodun altında numara göstermemek için
    });

    // Barkod numarasını ekleme
    barcodeNumberContainer.textContent = barcodeValue;
}

// Form submit event listener
document.querySelector('.form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Formun submit edilmesini engeller

    await getRandomStoreData(); // Mağaza verisini çek
    updateMersisNo(); // MERSIS numarasını güncelle
    updateDateTimeFis(); // Tarih ve fiş numarasını güncelle

    // Ürünleri JSON dosyasından çekme
    fetch('../JSON/products.json')
        .then(response => response.json())
        .then(data => {
            const products = getRandomProducts(data, 7, 15); // Ürünleri rastgele seç
            updateProducts(products); // Ürünleri HTML'e ekle
            updateCardNumber(); // Kart numarasını güncelle
            const { formattedDate, formattedTime } = generateRandomDateTime();
            const totalPrice = products.reduce((acc, product) => acc + parseFloat(product.discounted_price), 0);
            generateBarcode(generateRandomMersisNo(), formattedDate, formattedTime, totalPrice); // Barkod oluştur
        });
});


// Fişi canvas üzerinde oluşturma ve PNG formatında indirme
function generateReceiptAsImage() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Canvas boyutları
    canvas.width = 500;
    canvas.height = 600;

    // Canvas arka planını beyaz yapma
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Mağaza bilgileri
    const storeName = document.querySelector('.m-name').textContent;
    const storeAddress = document.querySelector('.m-adres').textContent;
    const storeCity = document.querySelector('.city').textContent;
    const storePhone = document.querySelector('.tel').textContent;
    const mersisNo = document.querySelector('.m-mersisno p').textContent;
    const receiptDate = document.querySelector('.hist').textContent;
    const receiptTime = document.querySelector('.clock').textContent;
    const receiptNumber = document.querySelector('.m-fisno p').textContent;
    const totalPrice = document.querySelector('.m-total-price p').textContent;

    // Yazı rengi ve font ayarları
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';

    // Mağaza bilgilerini yazma
    ctx.fillText(`Mağaza Adı: ${storeName}`, 20, 30);
    ctx.fillText(`Adres: ${storeAddress}`, 20, 50);
    ctx.fillText(`Şehir: ${storeCity}`, 20, 70);
    ctx.fillText(`Telefon: ${storePhone}`, 20, 90);
    ctx.fillText(`MERSIS No: ${mersisNo}`, 20, 110);

    // Tarih ve saat bilgilerini yazma
    ctx.fillText(receiptDate, 20, 150);
    ctx.fillText(receiptTime, 20, 170);
    ctx.fillText(`Fiş No: ${receiptNumber}`, 20, 190);

    // Ürünlerin bilgilerini yazma
    let yPosition = 220;
    const products = document.querySelectorAll('.m-product');
    products.forEach(product => {
        const productName = product.querySelector('.m-product-name p').textContent;
        const productPrice = product.querySelector('.m-price p').textContent;
        ctx.fillText(`${productName} ${productPrice}`, 20, yPosition);
        yPosition += 20;
    });

    // Toplam fiyatı yazma
    ctx.fillText(`Toplam: ${totalPrice}`, 20, yPosition + 20);

    /* Canvas içeriğini PNG formatında indirilebilir dosya olarak sunma
    const imgURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imgURL;
    link.download = 'fis.png';  // İndirilecek dosyanın adı
    link.click();*/
}

// Form submit event listener'a ekleme
document.querySelector('.form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Formun submit edilmesini engeller

    await getRandomStoreData(); // Mağaza verisini çek
    updateMersisNo(); // MERSIS numarasını güncelle
    updateDateTimeFis(); // Tarih ve fiş numarasını güncelle

    // Ürünleri JSON dosyasından çekme
    fetch('../JSON/products.json')
        .then(response => response.json())
        .then(data => {
            const products = getRandomProducts(data, 7, 15); // Ürünleri rastgele seç
            updateProducts(products); // Ürünleri HTML'e ekle
            updateCardNumber(); // Kart numarasını güncelle
            const { formattedDate, formattedTime } = generateRandomDateTime();
            const totalPrice = products.reduce((acc, product) => acc + parseFloat(product.discounted_price), 0);
            generateBarcode(generateRandomMersisNo(), formattedDate, formattedTime, totalPrice); // Barkod oluştur

            // Fişi PNG olarak indir
            generateReceiptAsImage();
        });
});


// Barkod oluşturma ve HTML'e ekleme
function generateBarcode(mersisNo) {
    const barcodeContainer = document.getElementById("barcode"); // Barkodun konulacağı svg elementi
    const barcodeNumberContainer = document.querySelector(".m-br-number"); // Barkod numarasının yazılacağı div

    // EAN13 formatında MERSIS numarasının ilk 13 hanesini alıyoruz
    const barcodeValue = mersisNo.substring(0, 13);

    // JsBarcode ile barkod oluşturma
    JsBarcode(barcodeContainer, barcodeValue, {
        format: "EAN13",  // Barkod türü
        width: 3,         // Barkod çizgilerinin genişliği
        height: 100,      // Barkod yüksekliği
        displayValue: true // Barkodun altında numara göstermemek için
    });

    // Barkod numarasını ekleme
    barcodeNumberContainer.textContent = barcodeValue;
}