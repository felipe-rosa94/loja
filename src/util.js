import {randomFillSync} from 'crypto'

const requisicao = async (url, conexao) => {
    return await fetch(url, conexao).then((data) => data.json()).catch((error) => (error))
}

const removeAcentos = texto => {
    texto = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    texto = texto.toLowerCase()
    texto = texto.trim()
    return texto
}

const padronizacao = texto => {
    texto = texto.normalize("NFD").replace(/[^A-Z0-9]/ig, "")
    texto = texto.trim()
    return texto.toLowerCase()
}

const mascaraCpf = cpf => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, '\$1.\$2.\$3\-\$4')
}

const mascaraTelefone = telefone => {
    if (telefone !== '') {
        telefone = telefone.substring(0, 14)
        return telefone.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2')
    }
}

const validaCPF = cpf => {
    cpf = cpf.replace(/[^\d]+/g, '')
    if (cpf === '') return false
    if (cpf.length !== 11 ||
        cpf === "00000000000" ||
        cpf === "11111111111" ||
        cpf === "22222222222" ||
        cpf === "33333333333" ||
        cpf === "44444444444" ||
        cpf === "55555555555" ||
        cpf === "66666666666" ||
        cpf === "77777777777" ||
        cpf === "88888888888" ||
        cpf === "99999999999")
        return false
    let add = 0
    let rev
    for (let i = 0; i < 9; i++)
        add += parseInt(cpf.charAt(i)) * (10 - i)
    rev = 11 - (add % 11)
    if (rev === 10 || rev === 11)
        rev = 0
    if (rev !== parseInt(cpf.charAt(9)))
        return false
    add = 0
    for (let i = 0; i < 10; i++)
        add += parseInt(cpf.charAt(i)) * (11 - i)
    rev = 11 - (add % 11)
    if (rev === 10 || rev === 11)
        rev = 0
    if (rev !== parseInt(cpf.charAt(10)))
        return false
    return true
}

const chave = () => {
    let wishlist = '0123456789'
    return Array.from(randomFillSync(new Uint8Array(15))).map((x) => wishlist[x % wishlist.length]).join('')
}

const idPedido = () => {
    let wishlist = 'qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM'
    let a = Array.from(randomFillSync(new Uint8Array(5))).map((x) => wishlist[x % wishlist.length]).join('')
    let date = new Date()
    let b = date.getTime()
    return `${a}${b}`
}

const simplificaIdPedido = id_pedido => {
    return `#${id_pedido.substring(id_pedido.length - 5)}`
}

const mostraDados = dados => {
    if (dados) {
        dados = dados.split('').reverse().join('')
        dados = atob(dados)
        return JSON.parse(dados)
    }
}

const escondeDados = dados => {
    if (dados) {
        dados = JSON.stringify(dados)
        dados = btoa(dados)
        dados = dados.split('').reverse().join('')
        return dados
    }
}

const searchEmJSON = search => {
    let pairs = search.substring(1).split('&'), objeto = {}, pair, i;
    for (i in pairs) {
        if (pairs[i] === '') continue
        pair = pairs[i].split('=')
        objeto[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1])
    }
    return objeto
}

const rolagem = (id, tempoDeRolagem) => {
    try {
        let target = document.getElementById(id)
        let elem = document.scrollingElement || document.documentElement
        let style = 'scrollTop'
        let unit = ''
        let from = window.scrollY
        let prop = true
        let to = (target.offsetTop - 70)
        if (!elem) return
        var start = new Date().getTime(),
            timer = setInterval(function () {
                var step = Math.min(1, (new Date().getTime() - start) / tempoDeRolagem)
                if (prop) {
                    elem[style] = (from + step * (to - from)) + unit
                } else {
                    elem.style[style] = (from + step * (to - from)) + unit
                }
                if (step === 1) {
                    clearInterval(timer)
                }
            }, 25);
        if (prop) {
            elem[style] = from + unit
        } else {
            elem.style[style] = from + unit
        }
    } catch (e) {

    }
}

const isEmptyObject = (objeto) => {
    return (Object.keys(objeto).length === 0)
}

const converteNumeroWhatsApp = numero => {
    if (numero === '') return
    numero = numero.substring(1)
    numero = numero.split(')')
    return `${numero[0]}${numero[1].substring(2)}`
}

const expiracao = () => {
    let date = new Date()
    date.setHours(date.getHours() + 2)
    return date.getTime()
}

export {
    requisicao,
    removeAcentos,
    padronizacao,
    mascaraCpf,
    mascaraTelefone,
    validaCPF,
    chave,
    idPedido,
    simplificaIdPedido,
    mostraDados,
    escondeDados,
    searchEmJSON,
    rolagem,
    isEmptyObject,
    converteNumeroWhatsApp,
    expiracao
}
