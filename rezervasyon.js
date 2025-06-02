document.addEventListener("DOMContentLoaded", function () {
  const dateInput = document.getElementById("date");
  const timeSelect = document.getElementById("time");
  const branchSelect = document.getElementById("branch");
  const form = document.getElementById("reservation-form");

  const allowedHours = [
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  // --- Tarih girişini sınırla (bugün +15 gün)
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 15);

  const toDateInputFormat = (d) => d.toISOString().split("T")[0];
  dateInput.min = toDateInputFormat(today);
  dateInput.max = toDateInputFormat(maxDate);

  // --- Saat listesini güncelle
  function updateTimeOptions(selectedDateStr) {
    // Listeyi temizle
    timeSelect.innerHTML =
      '<option value="" disabled selected>Saat seçiniz..</option>';

    const now = new Date();
    const selectedDate = new Date(selectedDateStr + "T00:00");

    allowedHours.forEach((time) => {
      const [hour, minute] = time.split(":").map(Number);
      const timeDate = new Date(selectedDate);
      timeDate.setHours(hour, minute, 0, 0);

      if (
        toDateInputFormat(now) !== selectedDateStr || // ileri bir tarihse tüm saatler
        timeDate.getTime() > now.getTime() // bugünse sadece ileri saatler
      ) {
        const option = document.createElement("option");
        option.value = time;
        option.textContent = time;
        timeSelect.appendChild(option);
      }
    });
  }

  // --- Sayfa yüklendiğinde bugünün saatlerine göre listele
  updateTimeOptions(toDateInputFormat(today));

  // --- Tarih değiştiğinde saat listesini güncelle
  dateInput.addEventListener("change", function () {
    updateTimeOptions(this.value);
  });

  // --- URL parametresinden otomatik branş seçimi
  const params = new URLSearchParams(window.location.search);
  const selectedBranch = params.get("branş");
  if (selectedBranch && branchSelect) {
    branchSelect.value = selectedBranch;
  }

  // --- Form gönderildiğinde uyarı ver ve formu sıfırla
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      alert("Rezervasyonuz gönderildi! Teşekkür ederiz.");
      this.reset();
      updateTimeOptions(toDateInputFormat(today)); // reset sonrası saatleri yenile
    });
  }
});
// Mail için
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("reservation-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const formData = new FormData(this);

      fetch("send_mail.php", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.text())
        .then((data) => {
          document.getElementById("message").innerText = data;
        })
        .catch((error) => {
          document.getElementById("message").innerText = "Bir hata oluştu.";
          console.error(error);
        });
    });
  }
});
