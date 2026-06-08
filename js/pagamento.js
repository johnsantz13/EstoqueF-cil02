document.addEventListener('DOMContentLoaded', () => {
    const appDataKey = 'estoqueFacilData';
    const cartItemsEl = document.getElementById('checkout-items');
    const subtotalEl = document.getElementById('checkout-subtotal');
    const serviceEl = document.getElementById('checkout-service');
    const totalEl = document.getElementById('checkout-total');
    const orderNumberEl = document.getElementById('checkout-order-number');
    const methods = document.querySelectorAll('.payment-method');
    const panels = document.querySelectorAll('.payment-panel');
    const confirmButton = document.getElementById('confirm-payment');
    const copyPixButton = document.getElementById('copy-pix');
    const pixCodeEl = document.getElementById('pix-code');
    const successOverlay = document.getElementById('success-overlay');
    const successMethodEl = document.getElementById('success-method');
    const successTotalEl = document.getElementById('success-total');
    const whatsappButton = document.getElementById('send-whatsapp');

    const getAppData = () => {
        const data = localStorage.getItem(appDataKey);
        return data ? JSON.parse(data) : { cart: [] };
    };

    const saveAppData = (data) => {
        localStorage.setItem(appDataKey, JSON.stringify(data));
    };

    const getCart = () => getAppData().cart || [];
    const saveCart = (cart) => {
        const appData = getAppData();
        appData.cart = cart;
        saveAppData(appData);
    };
    const formatCurrency = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const orderNumber = localStorage.getItem('checkoutOrderNumber') || `EF-${Date.now().toString().slice(-6)}`;
    localStorage.setItem('checkoutOrderNumber', orderNumber);
    orderNumberEl.textContent = orderNumber;

    let selectedMethod = 'pix';
    let pixCharge = null;
    let simulatePixButton = null;
    let totals = renderOrder();
    renderPix(totals.total);

    methods.forEach((methodButton) => {
        methodButton.addEventListener('click', () => {
            selectedMethod = methodButton.dataset.method;
            methods.forEach((button) => button.classList.toggle('active', button === methodButton));
            panels.forEach((panel) => panel.classList.toggle('active', panel.dataset.panel === selectedMethod));
            if (selectedMethod === 'pix') renderPix(totals.total);
        });
    });

    copyPixButton.addEventListener('click', async () => {
        await navigator.clipboard.writeText(pixCodeEl.value);
        copyPixButton.textContent = 'Copiado';
        setTimeout(() => { copyPixButton.textContent = 'Copiar codigo PIX'; }, 1600);
    });

    confirmButton.addEventListener('click', async () => {
        const cart = getCart();
        if (cart.length === 0) {
            window.location.href = 'cardapio.html';
            return;
        }

        if (selectedMethod === 'pix') {
            if (!pixCharge?.id) {
                alert('Aguarde a geracao do PIX antes de confirmar o pagamento.');
                return;
            }

            const pixStatus = await checkPixStatus();
            if (pixStatus !== 'PAID') {
                alert('Ainda nao identificamos o pagamento PIX. Pague o QR Code e tente confirmar novamente.');
                return;
            }
        }

        const appData = getAppData();
        const history = appData.checkoutHistory || [];
        const payment = {
            id: orderNumber,
            method: selectedMethod,
            abacatePayPixId: pixCharge?.id || null,
            items: cart,
            subtotal: totals.subtotal,
            service: totals.service,
            total: totals.total,
            createdAt: new Date().toISOString()
        };

        history.push(payment);
        appData.checkoutHistory = history;
        appData.cart = [];
        saveAppData(appData);
        localStorage.removeItem('checkoutOrderNumber');

        successMethodEl.textContent = methodLabel(selectedMethod);
        successTotalEl.textContent = formatCurrency(totals.total);
        successOverlay.classList.add('active');
    });

    whatsappButton.addEventListener('click', () => {
        const lastPayment = (getAppData().checkoutHistory || []).slice(-1)[0];
        const message = lastPayment ? buildWhatsAppMessage(lastPayment) : 'Pedido confirmado no Estoque Facil.';
        window.open(`https://wa.me/5500000000000?text=${encodeURIComponent(message)}`, '_blank');
        window.location.href = 'cardapio.html';
    });

    cartItemsEl.addEventListener('click', (event) => {
        const actionButton = event.target.closest('[data-cart-action]');
        if (!actionButton) return;

        const index = Number(actionButton.dataset.index);
        const action = actionButton.dataset.cartAction;
        const cart = getCart();
        const item = cart[index];
        if (!item) return;

        if (action === 'remove') {
            cart.splice(index, 1);
        }

        if (action === 'decrease') {
            item.quantity = Math.max(1, Number(item.quantity || 1) - 1);
            item.total = calculateItemTotal(item);
        }

        if (action === 'increase') {
            item.quantity = Number(item.quantity || 1) + 1;
            item.total = calculateItemTotal(item);
        }

        saveCart(cart);
        refreshCheckout();
    });

    function renderOrder() {
        const cart = getCart();
        cartItemsEl.innerHTML = '';

        if (cart.length === 0) {
            cartItemsEl.innerHTML = '<p class="text-center text-gray-500 py-8">Seu carrinho esta vazio.</p>';
            confirmButton.disabled = true;
            confirmButton.classList.add('opacity-60', 'cursor-not-allowed');
            return updateTotals(0);
        }

        confirmButton.disabled = false;
        confirmButton.classList.remove('opacity-60', 'cursor-not-allowed');

        cart.forEach((item, index) => {
            const extras = (item.extras || []).map((extra) => `<span class="block text-xs text-gray-500">+ ${extra.text}</span>`).join('');
            const itemEl = document.createElement('div');
            itemEl.className = 'order-item';
            itemEl.innerHTML = `
                <div class="order-item-main">
                    <div>
                        <p class="font-bold text-gray-900">${item.quantity}x ${item.name}</p>
                        ${extras}
                        ${item.observations ? `<p class="text-xs text-gray-500 mt-1">Obs: ${item.observations}</p>` : ''}
                    </div>
                    <strong class="text-orange-600">${formatCurrency(item.total)}</strong>
                </div>
                <div class="order-item-actions">
                    <div class="quantity-control" aria-label="Alterar quantidade">
                        <button type="button" data-cart-action="decrease" data-index="${index}" aria-label="Diminuir quantidade">-</button>
                        <span>${item.quantity}</span>
                        <button type="button" data-cart-action="increase" data-index="${index}" aria-label="Aumentar quantidade">+</button>
                    </div>
                    <button type="button" class="remove-order-item" data-cart-action="remove" data-index="${index}">
                        Remover
                    </button>
                </div>
            `;
            cartItemsEl.appendChild(itemEl);
        });

        const subtotal = cart.reduce((sum, item) => sum + Number(item.total || 0), 0);
        return updateTotals(subtotal);
    }

    function refreshCheckout() {
        totals = renderOrder();
        if (selectedMethod === 'pix') {
            renderPix(totals.total);
        }
    }

    function calculateItemTotal(item) {
        const extrasTotal = (item.extras || []).reduce((sum, extra) => sum + Number(extra.value || 0), 0);
        return (Number(item.price || 0) + extrasTotal) * Number(item.quantity || 1);
    }

    function updateTotals(subtotal) {
        const service = subtotal * 0.10;
        const total = subtotal + service;
        subtotalEl.textContent = formatCurrency(subtotal);
        serviceEl.textContent = formatCurrency(service);
        totalEl.textContent = formatCurrency(total);
        return { subtotal, service, total };
    }

    async function renderPix(total) {
        const qrcodeEl = document.getElementById('pix-qrcode');
        const amount = Math.round(Number(total || 0) * 100);

        pixCharge = null;
        removeSimulatePixButton();
        qrcodeEl.innerHTML = '';
        pixCodeEl.value = 'Gerando cobranca PIX...';
        copyPixButton.disabled = true;

        if (!amount) {
            pixCodeEl.value = '';
            return;
        }

        try {
            const response = await fetch('/api/abacatepay/pix', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    description: `Pedido ${orderNumber} - Estoque Facil`,
                    expiresIn: 3600,
                    metadata: {
                        pedidoId: orderNumber,
                        origem: 'checkout-web'
                    }
                })
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Nao foi possivel gerar o PIX.');
            }

            pixCharge = result.data;
            pixCodeEl.value = pixCharge.brCode || '';
            copyPixButton.disabled = !pixCharge.brCode;
            renderSimulatePixButton();

            if (pixCharge.brCodeBase64) {
                qrcodeEl.innerHTML = `<img src="${pixCharge.brCodeBase64}" alt="QR Code PIX AbacatePay" class="w-[180px] h-[180px] object-contain">`;
                return;
            }

            if (window.QRCode && pixCharge.brCode) {
                new QRCode(qrcodeEl, {
                    text: pixCharge.brCode,
                    width: 180,
                    height: 180,
                    correctLevel: QRCode.CorrectLevel.M
                });
            }
        } catch (error) {
            qrcodeEl.innerHTML = '<p class="text-sm text-red-600 text-center">PIX indisponivel.</p>';
            pixCodeEl.value = error.message || 'Nao foi possivel gerar a cobranca PIX.';
        }
    }

    function renderSimulatePixButton() {
        removeSimulatePixButton();

        if (!pixCharge?.devMode) return;

        simulatePixButton = document.createElement('button');
        simulatePixButton.type = 'button';
        simulatePixButton.className = 'checkout-button secondary mt-3 ml-0 sm:ml-3 w-full sm:w-auto';
        simulatePixButton.textContent = 'Simular pagamento';

        simulatePixButton.addEventListener('click', async () => {
            simulatePixButton.disabled = true;
            simulatePixButton.textContent = 'Simulando...';

            try {
                const response = await fetch(`/api/abacatepay/pix/${encodeURIComponent(pixCharge.id)}/simular`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ metadata: { pedidoId: orderNumber } })
                });
                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.error || 'Nao foi possivel simular o pagamento.');
                }

                pixCharge = result.data || pixCharge;
                await checkPixStatus();
                simulatePixButton.textContent = 'Pagamento simulado';
            } catch (error) {
                simulatePixButton.disabled = false;
                simulatePixButton.textContent = 'Simular pagamento';
                alert(error.message || 'Nao foi possivel simular o pagamento PIX.');
            }
        });

        copyPixButton.insertAdjacentElement('afterend', simulatePixButton);
    }

    function removeSimulatePixButton() {
        if (simulatePixButton) {
            simulatePixButton.remove();
            simulatePixButton = null;
        }
    }

    async function checkPixStatus() {
        try {
            const response = await fetch(`/api/abacatepay/pix/${encodeURIComponent(pixCharge.id)}`);
            const result = await response.json();
            if (response.ok && result.data?.status) {
                pixCharge.status = result.data.status;
                return pixCharge.status;
            }
        } catch (error) {
            console.warn('Nao foi possivel consultar o status do PIX.', error);
        }

        return pixCharge?.status;
    }

    function methodLabel(method) {
        const labels = {
            pix: 'PIX',
            card: 'Cartao',
            cash: 'Dinheiro',
            counter: 'Pagamento no balcao'
        };
        return labels[method] || method;
    }

    function buildWhatsAppMessage(payment) {
        let message = `Pedido ${payment.id} confirmado.\n\n`;
        payment.items.forEach((item) => {
            message += `${item.quantity}x ${item.name} - ${formatCurrency(item.total)}\n`;
        });
        message += `\nForma de pagamento: ${methodLabel(payment.method)}\nTotal: ${formatCurrency(payment.total)}`;
        return message;
    }
});
