document.addEventListener("DOMContentLoaded", function () {
  const reservationForm = document.getElementById("reservationForm");
  const successMessage = document.getElementById("successMessage");
  const errorMessage = document.getElementById("errorMessage");
  const dateInput = document.getElementById("date");
  const timeSelect = document.getElementById("time");
  const branchSelect = document.getElementById("branch");
  const submitButton = document.querySelector(".rez-btn");

  // Sabit değişkenler
  const allowedHours = Array.from({ length: 10 }, (_, i) => `${i + 10}:00`);

  // Loading durumunu yönet
  function setLoadingState(isLoading) {
    if (submitButton) {
      if (isLoading) {
        submitButton.classList.add('loading');
        submitButton.disabled = true;
      } else {
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
      }
    }
  }

  // Form validasyonu
  function validateForm(formData) {
    const errors = [];
    
    if (!formData.name.trim()) {
      errors.push("Ad Soyad alanı boş olamaz");
    }
    
    if (!formData.email.trim()) {
      errors.push("E-posta alanı boş olamaz");
    } else if (!isValidEmail(formData.email)) {
      errors.push("Geçerli bir e-posta adresi giriniz");
    }
    
    if (!formData.phone.trim()) {
      errors.push("Telefon alanı boş olamaz");
    } else if (!isValidPhone(formData.phone)) {
      errors.push("Geçerli bir telefon numarası giriniz (5xx xxx xx xx)");
    }
    
    if (!formData.branch) {
      errors.push("Branş seçimi yapılmadı");
    }
    
    if (!formData.date) {
      errors.push("Tarih seçimi yapılmadı");
    }
    
    if (!formData.time) {
      errors.push("Saat seçimi yapılmadı");
    }
    
    if (!formData.people || formData.people < 1 || formData.people > 10) {
      errors.push("Geçerli bir katılımcı sayısı giriniz (1-10 arası)");
    }
    
    return errors;
  }

  // E-posta validasyonu
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Telefon validasyonu
  function isValidPhone(phone) {
    const phoneRegex = /^5\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  // Hata mesajını göster
  function showError(message) {
    if (errorMessage) {
      errorMessage.textContent = message;
      errorMessage.style.display = "block";
      setTimeout(() => {
        errorMessage.style.display = "none";
      }, 5000);
    } else {
      alert(message);
    }
  }

  // Başarı mesajını göster
  function showSuccess(formData) {
    if (successMessage) {
      const branchEmojis = {
        Kano: "🛶 Kano",
        Surf: "🌊 WindSurf",
        Sup: "🏄 SUP",
      };
      document.getElementById("successBranch").textContent =
        branchEmojis[formData.branch] || formData.branch;
      document.getElementById("successDate").textContent = formData.date;
      document.getElementById("successTime").textContent = formData.time;
      
      const cardFloating = document.querySelector(".rez-card-floating");
      if (cardFloating) {
        cardFloating.style.display = "none";
      }
      successMessage.style.display = "block";
      
      if (errorMessage) {
        errorMessage.style.display = "none";
      }
    }
  }

  // Rezervasyonları MongoDB'ye kaydet ve tüm rezervasyonları getir
  async function saveAndGetReservations(formData) {
    try {
      const response = await fetch(
        "https://su-sporlari.onrender.com/api/reservations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Rezervasyon kaydedilemedi");
      }

      const data = await response.json();
      return data.reservations;
    } catch (error) {
      console.error("Rezervasyon işlemi sırasında hata:", error);
      throw error;
    }
  }

  // Rezervasyon listesini HTML formatına çevir
  function formatReservationsList(reservations) {
    return `
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Müşteri</th>
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Tarih</th>
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Saat</th>
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Branş</th>
          </tr>
        </thead>
        <tbody>
          ${reservations
            .map(
              (reservation) => `
            <tr style="border-bottom: 1px solid #ddd;">
              <td style="padding: 12px;">${reservation.name}</td>
              <td style="padding: 12px;">${reservation.date}</td>
              <td style="padding: 12px;">${reservation.time}</td>
              <td style="padding: 12px;">${reservation.branch}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
  }

  // Tarih sınırlamalarını ayarla
  function setupDateConstraints() {
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 15);

    const toDateInputFormat = (d) => d.toISOString().split("T")[0];
    dateInput.min = toDateInputFormat(today);
    dateInput.max = toDateInputFormat(maxDate);
    dateInput.value = toDateInputFormat(today);
  }

  // Saat seçeneklerini güncelle
  function updateTimeOptions(selectedDateStr) {
    timeSelect.innerHTML =
      '<option value="" disabled selected>Saat seçiniz..</option>';

    const now = new Date();
    const selectedDate = new Date(selectedDateStr + "T00:00");

    allowedHours.forEach((time) => {
      const [hour, minute] = time.split(":").map(Number);
      const timeDate = new Date(selectedDate);
      timeDate.setHours(hour, minute, 0, 0);

      if (
        selectedDate.toDateString() !== now.toDateString() || // farklı bir günse
        timeDate.getTime() > now.getTime() // bugün ama daha geçmemiş saat
      ) {
        const option = document.createElement("option");
        option.value = time;
        option.textContent = time;
        timeSelect.appendChild(option);
      }
    });
  }

  // URL parametresinden branş seçimi
  function handleBranchSelection() {
    const params = new URLSearchParams(window.location.search);
    const selectedBranch = params.get("branş");
    if (selectedBranch && branchSelect) {
      branchSelect.value = selectedBranch;
    }
  }

  // Form alanlarını canlı olarak doğrula
  function setupLiveValidation() {
    const inputs = reservationForm.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      input.addEventListener('blur', function() {
        validateField(this);
      });
      
      input.addEventListener('input', function() {
        clearFieldError(this);
      });
    });
  }

  // Alan doğrulama
  function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    switch(field.id) {
      case 'name':
        if (!value) {
          isValid = false;
          errorMessage = 'Ad Soyad gereklidir';
        }
        break;
      case 'email':
        if (!value) {
          isValid = false;
          errorMessage = 'E-posta gereklidir';
        } else if (!isValidEmail(value)) {
          isValid = false;
          errorMessage = 'Geçerli bir e-posta giriniz';
        }
        break;
      case 'phone':
        if (!value) {
          isValid = false;
          errorMessage = 'Telefon gereklidir';
        } else if (!isValidPhone(value)) {
          isValid = false;
          errorMessage = 'Geçerli telefon formatı: 5xx xxx xx xx';
        }
        break;
      case 'participants':
        const num = parseInt(value);
        if (!num || num < 1 || num > 10) {
          isValid = false;
          errorMessage = '1-10 arası katılımcı sayısı giriniz';
        }
        break;
    }

    if (!isValid) {
      showFieldError(field, errorMessage);
    } else {
      clearFieldError(field);
    }

    return isValid;
  }

  // Alan hatası göster
  function showFieldError(field, message) {
    clearFieldError(field);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      color: #e74c3c;
      font-size: 0.85rem;
      margin-top: 0.3rem;
      padding: 0.3rem 0.5rem;
      background: rgba(231, 76, 60, 0.1);
      border-radius: 4px;
      border-left: 3px solid #e74c3c;
    `;
    
    field.parentNode.appendChild(errorDiv);
    field.style.borderColor = '#e74c3c';
  }

  // Alan hatasını temizle
  function clearFieldError(field) {
    const errorDiv = field.parentNode.querySelector('.field-error');
    if (errorDiv) {
      errorDiv.remove();
    }
    field.style.borderColor = '';
  }

  if (reservationForm) {
    reservationForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Form verilerini al
      const formData = {
        name: document.getElementById("name").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        email: document.getElementById("email").value.trim(),
        date: document.getElementById("date").value,
        time: document.getElementById("time").value,
        people: parseInt(document.getElementById("participants").value),
        notes: document.getElementById("message").value.trim(),
        branch: document.getElementById("branch").value,
      };

      // Form validasyonu
      const validationErrors = validateForm(formData);
      if (validationErrors.length > 0) {
        showError(validationErrors.join('\n'));
        return;
      }

      // Loading durumunu başlat
      setLoadingState(true);

      try {
        // Başarı mesajını hemen göster
        showSuccess(formData);

        // Sunucuya kaydetme ve e-posta işlemleri arka planda başlasın
        const allReservations = await saveAndGetReservations(formData);
        await emailjs.send("service_vtwshmq", "template_8rxsicl", formData);
        
        const adminData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          branch: formData.branch,
          date: formData.date,
          time: formData.time,
          people: formData.people,
          notes: formData.notes || "Not belirtilmedi",
          reservations: formatReservationsList(allReservations),
        };
        await emailjs.send("service_vtwshmq", "template_ik4vh2r", adminData);
        
      } catch (error) {
        console.error("Rezervasyon işlemi hatası:", error);
        showError("Rezervasyon kaydedilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
        
        // Hata durumunda formu tekrar göster
        const cardFloating = document.querySelector(".rez-card-floating");
        if (cardFloating) {
          cardFloating.style.display = "flex";
        }
        if (successMessage) {
          successMessage.style.display = "none";
        }
      } finally {
        setLoadingState(false);
      }
    });
  }

  // Event listeners
  dateInput.addEventListener("change", () => {
    const min = dateInput.min;
    const max = dateInput.max;
    if (dateInput.value < min) {
      dateInput.value = min;
      showError("En erken bugünden itibaren rezervasyon yapabilirsiniz.");
    } else if (dateInput.value > max) {
      dateInput.value = max;
      showError("En fazla 15 gün sonrasına kadar rezervasyon yapılabilir.");
    }
    updateTimeOptions(dateInput.value);
  });

  // Başlangıç ayarları
  setupDateConstraints();
  updateTimeOptions(dateInput.value);
  handleBranchSelection();
  setupLiveValidation();
});
