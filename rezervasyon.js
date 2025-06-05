document.addEventListener("DOMContentLoaded", function () {
  const dateInput = document.getElementById("date");
  const timeSelect = document.getElementById("time");
  const branchSelect = document.getElementById("branch");
  const form = document.getElementById("reservation-form");
  const messageDiv = document.getElementById("message");

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

  // --- Form gönderildiğinde
  if (form) {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      
      // Form verilerini al
      const formData = {
        name: form.querySelector('input[name="name"]').value,
        email: form.querySelector('input[name="email"]').value,
        phone: form.querySelector('input[name="phone"]').value,
        date: form.querySelector('input[name="date"]').value,
        time: form.querySelector('select[name="time"]').value,
        activity: form.querySelector('select[name="branch"]').value,
        participants: form.querySelector('input[name="participants"]').value
      };

      try {
        // Loading mesajı göster
        messageDiv.innerHTML = '<div class="loading">Rezervasyonunuz işleniyor...</div>';
        
        // API'ye istek gönder
        const response = await fetch('/api/reservations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
          // Başarılı mesajı göster
          messageDiv.innerHTML = `
            <div class="success">
              <h3>Rezervasyonunuz Başarıyla Oluşturuldu!</h3>
              <p>Onay maili adresinize gönderildi.</p>
            </div>
          `;
          // Formu sıfırla
          form.reset();
          updateTimeOptions(toDateInputFormat(today));
        } else {
          throw new Error(data.error || 'Bir hata oluştu');
        }
      } catch (error) {
        // Hata mesajı göster
        messageDiv.innerHTML = `
          <div class="error">
            <h3>Hata!</h3>
            <p>${error.message}</p>
          </div>
        `;
      }
    });
  }
});
