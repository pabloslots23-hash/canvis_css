/**
 * Vourne Store - Checkout Process
 * Proceso completo de checkout y pasarela de pago
 */

class CheckoutProcess {
    constructor() {
        this.shippingCost = 4.95; // Coste estándar de envío UE
        this.taxRate = 0.21; // IVA español
        this.currentStep = 1;
        this.totalSteps = 3;
        this.orderData = {
            customer: {},
            shipping: {},
            billing: {},
            payment: {},
            items: [],
            totals: {}
        };

        this.init();
    }

    async init() {
        if (!await this.validateCart()) {
            return;
        }

        this.loadCartItems();
        this.setupEventListeners();
        this.calculateTotals();
        this.validateCurrentStep();
        this.setupFormValidation();
        
        console.log('Checkout inicializado');
    }

    // Validar que el carrito no esté vacío
    async validateCart() {
        const cart = this.getCart();
        
        if (!cart || cart.isEmpty()) {
            this.showError('Tu carrito está vacío. Redirigiendo...');
            setTimeout(() => {
                window.location.href = '/cart.html';
            }, 2000);
            return false;
        }
        
        return true;
    }

    // Obtener instancia del carrito
    getCart() {
        return window.cart;
    }

    // Cargar items del carrito
    loadCartItems() {
        const cart = this.getCart();
        if (cart) {
            this.orderData.items = cart.getItems();
            this.renderOrderSummary();
        }
    }

    // Configurar event listeners
    setupEventListeners() {
        // Navegación entre pasos
        document.querySelectorAll('.next-step').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleNextStep(e));
        });

        document.querySelectorAll('.prev-step').forEach(btn => {
            btn.addEventListener('click', (e) => this.handlePrevStep(e));
        });

        // Métodos de envío
        document.querySelectorAll('input[name="shipping_method"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.handleShippingChange(e));
        });

        // Métodos de pago
        document.querySelectorAll('input[name="payment_method"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.handlePaymentChange(e));
        });

        // Envío igual que facturación
        const sameAsBilling = document.getElementById('same-as-billing');
        if (sameAsBilling) {
            sameAsBilling.addEventListener('change', (e) => this.handleSameAsBilling(e));
        }

        // Términos y condiciones
        const termsCheckbox = document.getElementById('accept_terms');
        if (termsCheckbox) {
            termsCheckbox.addEventListener('change', () => this.validateCurrentStep());
        }

        // Envío del formulario
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Validación en tiempo real
        document.querySelectorAll('.form-control').forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Países UE para envío
        this.populateCountries();
    }

    // Configurar validación de formularios
    setupFormValidation() {
        // Añadir validación personalizada
        Object.assign(HTMLInputElement.prototype, {
            validate() {
                const validations = {
                    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
                    phone: (value) => /^[+]?[\d\s\-()]{10,}$/.test(value),
                    postalCode: (value) => /^\d{4,5}$/.test(value),
                    required: (value) => value.trim().length > 0
                };

                return validations[this.dataset.validation]?.(this.value) ?? true;
            }
        });
    }

    // Poblar select de países UE
    populateCountries() {
        const countries = {
            'ES': 'España',
            'PT': 'Portugal',
            'FR': 'Francia',
            'DE': 'Alemania',
            'IT': 'Italia',
            'NL': 'Países Bajos',
            'BE': 'Bélgica',
            'IE': 'Irlanda'
        };

        const countrySelects = document.querySelectorAll('select[id$="_country"]');
        
        countrySelects.forEach(select => {
            select.innerHTML = '<option value="">Seleccionar país</option>' +
                Object.entries(countries).map(([code, name]) => 
                    `<option value="${code}">${name}</option>`
                ).join('');
        });
    }

    // Manejar siguiente paso
    async handleNextStep(e) {
        e.preventDefault();
        
        if (!await this.validateStep(this.currentStep)) {
            this.showError('Por favor, completa todos los campos requeridos correctamente.');
            return;
        }

        this.saveStepData(this.currentStep);
        this.currentStep++;
        this.updateStepUI();
    }

    // Manejar paso anterior
    handlePrevStep(e) {
        e.preventDefault();
        this.currentStep--;
        this.updateStepUI();
    }

    // Actualizar UI del paso actual
    updateStepUI() {
        // Ocultar todos los pasos
        document.querySelectorAll('.checkout-step').forEach(step => {
            step.classList.remove('active');
        });

        // Mostrar paso actual
        const currentStepElement = document.querySelector(`[data-step="${this.currentStep}"]`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }

        // Actualizar indicadores de progreso
        this.updateProgressIndicators();
        
        // Actualizar botones de navegación
        this.updateNavigationButtons();

        // Validar paso actual
        this.validateCurrentStep();
    }

    // Actualizar indicadores de progreso
    updateProgressIndicators() {
        // Barra de progreso
        const progressBar = document.querySelector('.checkout-progress');
        if (progressBar) {
            const percentage = ((this.currentStep - 1) / (this.totalSteps - 1)) * 100;
            progressBar.style.width = `${percentage}%`;
        }

        // Números de paso
        document.querySelectorAll('.step-number').forEach((number, index) => {
            const stepIndex = index + 1;
            if (stepIndex < this.currentStep) {
                number.classList.add('completed');
                number.classList.remove('active');
            } else if (stepIndex === this.currentStep) {
                number.classList.add('active');
                number.classList.remove('completed');
            } else {
                number.classList.remove('active', 'completed');
            }
        });
    }

    // Actualizar botones de navegación
    updateNavigationButtons() {
        const prevButtons = document.querySelectorAll('.prev-step');
        const nextButtons = document.querySelectorAll('.next-step');

        // Mostrar/ocultar botones según el paso
        prevButtons.forEach(btn => {
            btn.style.display = this.currentStep > 1 ? 'block' : 'none';
        });

        // Cambiar texto del último paso
        nextButtons.forEach(btn => {
            if (this.currentStep === this.totalSteps) {
                btn.innerHTML = '<i class="fas fa-lock"></i> Completar pedido';
            } else {
                btn.innerHTML = 'Continuar <i class="fas fa-arrow-right"></i>';
            }
        });
    }

    // Validar paso actual
    validateCurrentStep() {
        const isValid = this.validateStep(this.currentStep);
        const nextButton = document.querySelector('.next-step');
        
        if (nextButton) {
            nextButton.disabled = !isValid;
        }

        return isValid;
    }

    // Validar paso específico
    async validateStep(step) {
        const stepElement = document.querySelector(`[data-step="${step}"]`);
        if (!stepElement) return true;

        let isValid = true;

        switch (step) {
            case 1:
                isValid = await this.validateCustomerInfo();
                break;
            case 2:
                isValid = await this.validateShippingInfo();
                break;
            case 3:
                isValid = await this.validatePaymentInfo();
                break;
        }

        return isValid;
    }

    // Validar información del cliente
    async validateCustomerInfo() {
        const fields = ['email', 'phone', 'first_name', 'last_name'];
        let isValid = true;

        for (const field of fields) {
            const input = document.getElementById(field);
            if (input && !this.validateField(input)) {
                isValid = false;
            }
        }

        // Validar email único (simulación)
        const email = document.getElementById('email')?.value;
        if (email && !await this.checkEmailAvailability(email)) {
            this.showFieldError('email', 'Este email ya está registrado');
            isValid = false;
        }

        return isValid;
    }

    // Validar información de envío
    async validateShippingInfo() {
        const fields = ['shipping_address', 'shipping_city', 'shipping_postal_code', 'shipping_country'];
        let isValid = true;

        for (const field of fields) {
            const input = document.getElementById(field);
            if (input && !this.validateField(input)) {
                isValid = false;
            }
        }

        // Validar método de envío seleccionado
        const shippingMethod = document.querySelector('input[name="shipping_method"]:checked');
        if (!shippingMethod) {
            this.showError('Por favor, selecciona un método de envío');
            isValid = false;
        }

        return isValid;
    }

    // Validar información de pago
    async validatePaymentInfo() {
        let isValid = true;

        // Validar método de pago
        const paymentMethod = document.querySelector('input[name="payment_method"]:checked');
        if (!paymentMethod) {
            this.showError('Por favor, selecciona un método de pago');
            isValid = false;
        }

        // Validar términos y condiciones
        const termsCheckbox = document.getElementById('accept_terms');
        if (termsCheckbox && !termsCheckbox.checked) {
            this.showError('Debes aceptar los términos y condiciones');
            isValid = false;
        }

        // Validaciones específicas por método de pago
        if (paymentMethod) {
            isValid = await this.validatePaymentMethod(paymentMethod.value) && isValid;
        }

        return isValid;
    }

    // Validar método de pago específico
    async validatePaymentMethod(method) {
        switch (method) {
            case 'credit_card':
                return this.validateCreditCard();
            case 'paypal':
                return true; // PayPal maneja su propia validación
            case 'bank_transfer':
                return true;
            default:
                return true;
        }
    }

    // Validar tarjeta de crédito
    validateCreditCard() {
        const fields = ['card_number', 'card_expiry', 'card_cvc', 'card_name'];
        let isValid = true;

        for (const field of fields) {
            const input = document.getElementById(field);
            if (input && !this.validateField(input)) {
                isValid = false;
            }
        }

        return isValid;
    }

    // Validar campo individual
    validateField(input) {
        const value = input.value.trim();
        let isValid = true;

        // Limpiar errores previos
        this.clearFieldError(input);

        // Validación de campo requerido
        if (input.required && !value) {
            this.showFieldError(input, 'Este campo es obligatorio');
            isValid = false;
        }

        // Validaciones específicas
        if (value) {
            switch (input.type) {
                case 'email':
                    if (!this.isValidEmail(value)) {
                        this.showFieldError(input, 'Email inválido');
                        isValid = false;
                    }
                    break;
                case 'tel':
                    if (!this.isValidPhone(value)) {
                        this.showFieldError(input, 'Teléfono inválido');
                        isValid = false;
                    }
                    break;
            }

            switch (input.id) {
                case 'shipping_postal_code':
                case 'billing_postal_code':
                    if (!this.isValidPostalCode(value)) {
                        this.showFieldError(input, 'Código postal inválido');
                        isValid = false;
                    }
                    break;
                case 'card_number':
                    if (!this.isValidCardNumber(value)) {
                        this.showFieldError(input, 'Número de tarjeta inválido');
                        isValid = false;
                    }
                    break;
            }
        }

        if (isValid) {
            this.showFieldSuccess(input);
        }

        return isValid;
    }

    // Limpiar error de campo
    clearFieldError(input) {
        const formGroup = input.closest('.form-group');
        if (formGroup) {
            formGroup.classList.remove('error', 'success');
            const errorElement = formGroup.querySelector('.error-message');
            if (errorElement) {
                errorElement.remove();
            }
        }
    }

    // Mostrar error de campo
    showFieldError(input, message) {
        const formGroup = input.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('error');
            formGroup.classList.remove('success');
            
            let errorElement = formGroup.querySelector('.error-message');
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'error-message';
                formGroup.appendChild(errorElement);
            }
            errorElement.textContent = message;
        }
    }

    // Mostrar éxito de campo
    showFieldSuccess(input) {
        const formGroup = input.closest('.form-group');
        if (formGroup) {
            formGroup.classList.add('success');
            formGroup.classList.remove('error');
        }
    }

    // Guardar datos del paso
    saveStepData(step) {
        switch (step) {
            case 1:
                this.saveCustomerInfo();
                break;
            case 2:
                this.saveShippingInfo();
                break;
            case 3:
                this.savePaymentInfo();
                break;
        }
    }

    // Guardar información del cliente
    saveCustomerInfo() {
        this.orderData.customer = {
            email: this.getValue('email'),
            phone: this.getValue('phone'),
            firstName: this.getValue('first_name'),
            lastName: this.getValue('last_name')
        };
    }

    // Guardar información de envío
    saveShippingInfo() {
        this.orderData.shipping = {
            address: this.getValue('shipping_address'),
            city: this.getValue('shipping_city'),
            postalCode: this.getValue('shipping_postal_code'),
            country: this.getValue('shipping_country'),
            method: document.querySelector('input[name="shipping_method"]:checked')?.value
        };
    }

    // Guardar información de pago
    savePaymentInfo() {
        this.orderData.payment = {
            method: document.querySelector('input[name="payment_method"]:checked')?.value,
            cardName: this.getValue('card_name'),
            cardLastFour: this.getValue('card_number')?.slice(-4),
            termsAccepted: document.getElementById('accept_terms')?.checked
        };
    }

    // Obtener valor de campo
    getValue(fieldId) {
        const element = document.getElementById(fieldId);
        return element ? element.value.trim() : '';
    }

    // Manejar cambio de método de envío
    handleShippingChange(e) {
        this.updateShippingMethod(e.target.value);
    }

    // Actualizar método de envío
    updateShippingMethod(method) {
        switch (method) {
            case 'express':
                this.shippingCost = 9.95;
                break;
            case 'free':
                this.shippingCost = 0;
                break;
            case 'standard':
            default:
                this.shippingCost = 4.95;
                break;
        }
        this.calculateTotals();
    }

    // Manejar cambio de método de pago
    handlePaymentChange(e) {
        this.updatePaymentUI(e.target.value);
    }

    // Actualizar UI de pago
    updatePaymentUI(method) {
        // Ocultar todos los campos de pago
        document.querySelectorAll('.payment-fields').forEach(field => {
            field.style.display = 'none';
        });

        // Mostrar campos específicos
        const specificFields = document.querySelector(`.${method}-fields`);
        if (specificFields) {
            specificFields.style.display = 'block';
        }
    }

    // Manejar "igual que facturación"
    handleSameAsBilling(e) {
        this.toggleBillingAddress(!e.target.checked);
    }

    // Mostrar/ocultar dirección de facturación
    toggleBillingAddress(show) {
        const billingAddress = document.getElementById('billing-address-fields');
        if (billingAddress) {
            billingAddress.style.display = show ? 'block' : 'none';
            
            if (!show) {
                // Copiar datos de envío a facturación
                this.copyShippingToBilling();
            }
        }
    }

    // Copiar envío a facturación
    copyShippingToBilling() {
        const fields = ['address', 'city', 'postal_code', 'country'];
        fields.forEach(field => {
            const shippingValue = document.getElementById(`shipping_${field}`)?.value;
            const billingField = document.getElementById(`billing_${field}`);
            if (billingField && shippingValue) {
                billingField.value = shippingValue;
            }
        });
    }

    // Renderizar resumen del pedido
    renderOrderSummary() {
        const container = document.getElementById('order-summary');
        if (!container) return;

        const cart = this.getCart();
        if (!cart) return;

        const items = cart.getItems();
        const totals = cart.calculateTotal(this.shippingCost, this.taxRate);

        container.innerHTML = `
            <div class="order-summary-content">
                <h3>Resumen del pedido</h3>
                <div class="order-items">
                    ${items.map(item => `
                        <div class="order-item">
                            <div class="item-image">
                                <img src="${item.image}" alt="${item.name}">
                                <span class="item-quantity">${item.quantity}</span>
                            </div>
                            <div class="item-details">
                                <h4>${item.name}</h4>
                                <p class="item-variants">${item.size} | ${item.color}</p>
                                <p class="item-price">€${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="order-totals">
                    <div class="total-line">
                        <span>Subtotal</span>
                        <span>€${totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div class="total-line">
                        <span>Envío</span>
                        <span>€${totals.shipping.toFixed(2)}</span>
                    </div>
                    <div class="total-line">
                        <span>IVA (21%)</span>
                        <span>€${totals.tax.toFixed(2)}</span>
                    </div>
                    <div class="total-final">
                        <span>Total</span>
                        <span>€${totals.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Calcular totales
    calculateTotals() {
        const cart = this.getCart();
        if (cart) {
            this.orderData.totals = cart.calculateTotal(this.shippingCost, this.taxRate);
            this.renderOrderSummary();
        }
    }

    // Manejar envío del