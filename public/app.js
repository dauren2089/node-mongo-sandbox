const toCurrency = price => {
    return new Intl.NumberFormat('ru-RU', {
        currency: 'KZT',
        style: 'currency'
    }).format(price)
}

document.querySelectorAll('.price').forEach(node => {
    node.textContent = toCurrency(node.textContent)
})

M.Tabs.init(document.querySelectorAll('.tabs'));