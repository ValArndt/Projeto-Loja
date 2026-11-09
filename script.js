// ==========================================
// 1. MODEL (Dados e Regras de Negócio)
// ==========================================
const state = {
    produtos: [
        { id: 1, nome: "Chocolate Belga", preco: 8.90, categoria: "Chocolate", descricao: "Massa de chocolate belga com recheio cremoso e cobertura de ganache.", imagem: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400", sabores: ["Chocolate"] },
        { id: 2, nome: "Red Velvet", preco: 9.90, categoria: "Especiais", descricao: "Massa aveludada de baunilha e cacau com cobertura de cream cheese.", imagem: "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400", sabores: ["Red Velvet"] },
        { id: 3, nome: "Doce de Leite", preco: 8.90, categoria: "Especiais", descricao: "Massa de pão de ló recheada e coberta com doce de leite artesanal.", imagem: "https://images.unsplash.com/photo-1587668178277-295251f900ce?w=400", sabores: ["Doce de Leite"] },
        { id: 4, nome: "Morango Gourmet", preco: 9.90, categoria: "Frutados", descricao: "Massa fofinha com pedaços de morango fresco e chantilly especial.", imagem: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=400", sabores: ["Morango"] }
    ],
    carrinho: [
        { produtoId: 1, quantidade: 2 },
        { produtoId: 2, quantidade: 1 },
        { produtoId: 3, quantidade: 1 }
    ],
    detalhesProdutoTemp: {
        saborSelecionado: "Chocolate",
        quantidade: 1
    },
    endereco: {
        rua: "Rua das Flores, 123",
        bairro: "Centro",
        cidade: "São Paulo, SP",
        cep: "01234-567",
        tipoEntrega: "casa", // 'casa' ou 'loja'
        taxaEntrega: 7.90,
        dataEntrega: "24/05/2024",
        horarioEntrega: "14:00 - 15:00"
    },
    pagamento: {
        metodo: "pix" // 'pix', 'cartao', 'debito', 'dinheiro'
    },
    pedidoAtual: null,
    historicoPedidos: [
        {
            id: 'CUP12458',
            data: '24/05/2024 - 14:00',
            dataRecebido: '24/05/2024 - 13:20',
            itens: [
                { produtoId: 1, quantidade: 2, produto: { nome: "Chocolate Belga", preco: 8.90 } },
                { produtoId: 2, quantidade: 1, produto: { nome: "Red Velvet", preco: 9.90 } },
                { produtoId: 3, quantidade: 1, produto: { nome: "Doce de Leite", preco: 8.90 } }
            ],
            totais: { subtotal: 36.60, taxa: 7.90, total: 44.50 },
            endereco: { rua: "Rua das Flores, 123", bairro: "Centro", cidade: "São Paulo, SP", cep: "01234-567", tipoEntrega: "casa" },
            pagamento: "pix",
            status: "Em preparo"
        }
    ]
};

// ==========================================
// 2. CONTROLLER (Lógica de Controle e Ações)
// ==========================================
const controller = {
    getProdutos(categoria = 'Todos') {
        if (categoria === 'Todos') return state.produtos;
        return state.produtos.filter(p => p.categoria === categoria);
    },

    getProdutoById(id) {
        return state.produtos.find(p => p.id === parseInt(id));
    },

    adicionarAoCarrinho(produtoId) {
        const qtd = state.detalhesProdutoTemp.quantidade || 1;
        const item = state.carrinho.find(i => i.produtoId === produtoId);
        if (item) {
            item.quantidade += qtd;
        } else {
            state.carrinho.push({ produtoId, quantidade: qtd });
        }
        this.atualizarBadgeCarrinho();
        
        // Notificação flutuante com visual moderno alinhado ao app
        this.mostrarToast('Item adicionado ao carrinho!');
    },

    mostrarToast(mensagem) {
        const toastAntigo = document.getElementById('custom-toast');
        if (toastAntigo) toastAntigo.remove();

        const toast = document.createElement('div');
        toast.id = 'custom-toast';
        toast.className = 'fixed top-16 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center space-x-2 z-50 transition-all duration-300 opacity-0 scale-95 border border-slate-700';
        toast.innerHTML = `
            <i class="fa-solid fa-circle-check text-pink-400 text-sm"></i>
            <span>${mensagem}</span>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.remove('opacity-0', 'scale-95');
            toast.classList.add('opacity-100', 'scale-100');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('opacity-100', 'scale-100');
            toast.classList.add('opacity-0', 'scale-95');
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    },

    alterarQuantidadeCarrinho(produtoId, delta) {
        const item = state.carrinho.find(i => i.produtoId === produtoId);
        if (item) {
            item.quantidade += delta;
            if (item.quantidade <= 0) {
                state.carrinho = state.carrinho.filter(i => i.produtoId !== produtoId);
            }
        }
        this.atualizarBadgeCarrinho();
        router.navigate('carrinho');
    },

    alterarQtdDetalhes(delta) {
        state.detalhesProdutoTemp.quantidade = Math.max(1, state.detalhesProdutoTemp.quantidade + delta);
        document.getElementById('detalhe-qtd').textContent = state.detalhesProdutoTemp.quantidade;
    },

    selecionarSabor(sabor) {
        state.detalhesProdutoTemp.saborSelecionado = sabor;
        router.render();
    },

    limparCarrinho() {
        state.carrinho = [];
        this.atualizarBadgeCarrinho();
        router.navigate('carrinho');
    },

    atualizarBadgeCarrinho() {
        const totalItens = state.carrinho.reduce((acc, i) => acc + i.quantidade, 0);
        const badge = document.getElementById('cart-badge');
        if (badge) {
            if (totalItens > 0) {
                badge.textContent = totalItens;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    },

    calcularTotais() {
        const subtotal = state.carrinho.reduce((sum, item) => {
            const prod = this.getProdutoById(item.produtoId);
            return sum + (prod ? prod.preco * item.quantidade : 0);
        }, 0);
        const taxa = state.endereco.tipoEntrega === 'casa' ? state.endereco.taxaEntrega : 0;
        return {
            subtotal: subtotal,
            taxa: taxa,
            total: subtotal + taxa
        };
    },

    setTipoEntrega(tipo) {
        state.endereco.tipoEntrega = tipo;
        router.navigate('endereco');
    },

    salvarEnderecoEContinuar(event) {
        if (event) event.preventDefault();
        state.endereco.rua = document.getElementById('input-rua').value;
        state.endereco.bairro = document.getElementById('input-bairro').value;
        state.endereco.cidade = document.getElementById('input-cidade').value;
        state.endereco.cep = document.getElementById('input-cep').value;
        router.navigate('endereco');
    },

    setFormaPagamento(metodo) {
        state.pagamento.metodo = metodo;
        router.navigate('pagamento');
    },

    finalizarPedido() {
        const totais = this.calcularTotais();
        const novoPedido = {
            id: 'CUP12458',
            data: '24/05/2024 - 14:00',
            dataRecebido: '24/05/2024 - 13:20',
            itens: [...state.carrinho.map(i => ({ ...i, produto: this.getProdutoById(i.produtoId) }))],
            totais: totais,
            endereco: { ...state.endereco },
            pagamento: state.pagamento.metodo,
            status: 'Em preparo'
        };

        state.pedidoAtual = novoPedido;
        state.historicoPedidos.unshift(novoPedido);
        state.carrinho = [];
        this.atualizarBadgeCarrinho();
        router.navigate('confirmacao');
    }
};

// ==========================================
// 3. VIEW & ROUTER (Interface e Navegação)
// ==========================================
const router = {
    currentRoute: 'catalogo',
    params: {},

    navigate(route, params = {}) {
        this.currentRoute = route;
        this.params = params;
        this.render();
    },

    render() {
        const container = document.getElementById('app-view');
        if (!container) return;
        container.innerHTML = '';

        this.atualizarNavActive();

        switch (this.currentRoute) {
            case 'catalogo':
                container.innerHTML = views.catalogo();
                break;
            case 'detalhes':
                container.innerHTML = views.detalhes(this.params.id);
                break;
            case 'carrinho':
                container.innerHTML = views.carrinho();
                break;
            case 'endereco':
                container.innerHTML = views.endereco();
                break;
            case 'form-endereco':
                container.innerHTML = views.formEndereco();
                break;
            case 'pagamento':
                container.innerHTML = views.pagamento();
                break;
            case 'confirmacao':
                container.innerHTML = views.confirmacao();
                break;
            case 'acompanhar':
                container.innerHTML = views.acompanhar();
                break;
            case 'detalhes-pedido':
                container.innerHTML = views.detalhesPedido();
                break;
            case 'pedidos':
                container.innerHTML = views.pedidos();
                break;
            default:
                container.innerHTML = views.catalogo();
        }
    },

    atualizarNavActive() {
        ['catalogo', 'carrinho', 'pedidos'].forEach(r => {
            const btn = document.getElementById(`nav-${r}`);
            if (btn) {
                if (this.currentRoute === r) {
                    btn.className = "flex flex-col items-center text-pink-500 font-medium text-[11px]";
                } else {
                    btn.className = "flex flex-col items-center text-slate-400 font-medium text-[11px] hover:text-pink-500";
                }
            }
        });
    }
};

// Templates HTML das Telas
const views = {
    catalogo() {
        const produtos = controller.getProdutos();
        return `
            <div class="relative mb-4 flex items-center gap-2">
                <div class="relative flex-1">
                    <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-400 text-xs"></i>
                    <input type="text" placeholder="Buscar cupcakes..." class="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:border-pink-500">
                </div>
                <button class="bg-white border border-slate-200 p-1.5 rounded-lg text-slate-600 text-xs hover:bg-slate-50">
                    <i class="fa-solid fa-sliders"></i>
                </button>
            </div>

            <div class="bg-rose-50 rounded-2xl p-3 mb-4 flex items-center justify-between border border-rose-100">
                <div>
                    <h2 class="font-bold text-slate-800 text-xs mb-0.5">Novidades em Cupcakes!</h2>
                    <button class="bg-pink-500 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full mt-2 shadow-sm hover:bg-pink-600">Ver sabores</button>
                </div>
                <img src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=150" class="w-16 h-16 object-cover rounded-full shadow-sm">
            </div>

            <div class="mb-4">
                <h3 class="font-bold text-slate-700 text-xs mb-2">Categorias</h3>
                <div class="flex space-x-3 overflow-x-auto pb-1">
                    <button class="flex flex-col items-center min-w-[50px]">
                        <div class="w-10 h-10 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center text-xs mb-1"><i class="fa-solid fa-stroopwafel"></i></div>
                        <span class="text-[10px] font-medium text-pink-500">Todos</span>
                    </button>
                    <button class="flex flex-col items-center min-w-[50px]">
                        <div class="w-10 h-10 bg-white border border-slate-200 text-slate-600 rounded-full flex items-center justify-center text-xs mb-1"><i class="fa-solid fa-cookie"></i></div>
                        <span class="text-[10px] font-medium text-slate-500">Chocolate</span>
                    </button>
                    <button class="flex flex-col items-center min-w-[50px]">
                        <div class="w-10 h-10 bg-white border border-slate-200 text-slate-600 rounded-full flex items-center justify-center text-xs mb-1"><i class="fa-solid fa-apple-whole"></i></div>
                        <span class="text-[10px] font-medium text-slate-500">Frutados</span>
                    </button>
                    <button class="flex flex-col items-center min-w-[50px]">
                        <div class="w-10 h-10 bg-white border border-slate-200 text-slate-600 rounded-full flex items-center justify-center text-xs mb-1"><i class="fa-solid fa-star"></i></div>
                        <span class="text-[10px] font-medium text-slate-500">Especiais</span>
                    </button>
                </div>
            </div>

            <h3 class="font-bold text-slate-700 text-xs mb-2">Destaques</h3>
            <div class="grid grid-cols-2 gap-3">
                ${produtos.map(p => `
                    <div onclick="router.navigate('detalhes', {id: ${p.id}})" class="bg-white p-2 rounded-xl border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition">
                        <img src="${p.imagem}" class="w-full h-24 object-cover rounded-lg mb-2">
                        <h4 class="font-semibold text-slate-800 text-xs truncate">${p.nome}</h4>
                        <p class="text-slate-500 text-[10px]">R$ ${p.preco.toFixed(2).replace('.', ',')}</p>
                    </div>
                `).join('')}
            </div>
        `;
    },

    detalhes(id) {
        const p = controller.getProdutoById(id);
        if (!p) return `<p class="text-xs">Produto não encontrado</p>`;
        state.detalhesProdutoTemp.quantidade = 1;
        
        return `
            <div class="relative">
                <button onclick="router.navigate('catalogo')" class="absolute top-0 left-0 bg-white/80 p-1.5 rounded-full shadow text-slate-600 z-10">
                    <i class="fa-solid fa-arrow-left text-xs"></i>
                </button>
                <img src="${p.imagem}" class="w-full h-48 object-cover rounded-2xl mb-3">
                
                <h2 class="font-bold text-slate-800 text-sm mb-1">${p.nome}</h2>
                <span class="font-bold text-pink-500 text-sm block mb-2">R$ ${p.preco.toFixed(2).replace('.', ',')}</span>
                <p class="text-[11px] text-slate-500 mb-4 leading-relaxed">${p.descricao}</p>

                <div class="mb-4">
                    <label class="font-bold text-slate-700 text-xs block mb-2">Sabor</label>
                    <div class="flex space-x-2">
                        ${p.sabores.map(s => `
                            <button onclick="controller.selecionarSabor('${s}')" class="px-3 py-1 rounded-lg border text-[11px] font-medium ${state.detalhesProdutoTemp.saborSelecionado === s ? 'border-pink-500 bg-pink-50 text-pink-500' : 'border-slate-200 text-slate-600 bg-white'}">
                                ${s}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="mb-6">
                    <label class="font-bold text-slate-700 text-xs block mb-2">Quantidade</label>
                    <div class="flex items-center space-x-3 bg-slate-50 w-max px-3 py-1.5 rounded-lg border border-slate-200">
                        <button onclick="controller.alterarQtdDetalhes(-1)" class="text-slate-500 font-bold text-xs">-</button>
                        <span id="detalhe-qtd" class="text-xs font-bold text-slate-700 px-2">${state.detalhesProdutoTemp.quantidade}</span>
                        <button onclick="controller.alterarQtdDetalhes(1)" class="text-slate-500 font-bold text-xs">+</button>
                    </div>
                </div>

                <button onclick="controller.adicionarAoCarrinho(${p.id})" class="w-full bg-pink-500 text-white font-bold py-3 rounded-xl shadow-md text-xs hover:bg-pink-600 transition active:scale-95">
                    Adicionar ao carrinho
                </button>
            </div>
        `;
    },

    carrinho() {
        const totais = controller.calcularTotais();
        return `
            <div class="flex justify-between items-center mb-4">
                <h2 class="font-bold text-slate-800 text-sm">Meu Carrinho</h2>
                <button onclick="controller.limparCarrinho()" class="text-slate-400 hover:text-red-500 text-xs"><i class="fa-solid fa-trash-can"></i></button>
            </div>

            ${state.carrinho.length === 0 ? `
                <div class="text-center py-12">
                    <i class="fa-solid fa-basket-shopping text-4xl text-slate-300 mb-2"></i>
                    <p class="text-xs text-slate-400">Seu carrinho está vazio.</p>
                </div>
            ` : `
                <div class="space-y-3 mb-6">
                    ${state.carrinho.map(item => {
                        const prod = controller.getProdutoById(item.produtoId);
                        const totalItem = prod.preco * item.quantidade;
                        return `
                            <div class="bg-white p-2.5 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                                <img src="${prod.imagem}" class="w-12 h-12 object-cover rounded-lg">
                                <div class="flex-1 ml-3">
                                    <h4 class="font-semibold text-slate-800 text-xs">${prod.nome}</h4>
                                    <p class="text-[11px] text-slate-500">R$ ${prod.preco.toFixed(2).replace('.', ',')}</p>
                                </div>
                                <div class="flex items-center space-x-2 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                                    <button onclick="controller.alterarQuantidadeCarrinho(${prod.id}, -1)" class="text-xs font-bold text-slate-500 px-1">-</button>
                                    <span class="text-xs font-bold text-slate-700">${item.quantidade}</span>
                                    <button onclick="controller.alterarQuantidadeCarrinho(${prod.id}, 1)" class="text-xs font-bold text-slate-500 px-1">+</button>
                                </div>
                                <span class="text-xs font-bold text-slate-700 ml-2">R$ ${totalItem.toFixed(2).replace('.', ',')}</span>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div class="bg-white p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs mb-5">
                    <div class="flex justify-between text-slate-500">
                        <span>Subtotal</span>
                        <span>R$ ${totais.subtotal.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div class="flex justify-between text-slate-500">
                        <span>Taxa de entrega</span>
                        <span>R$ ${totais.taxa.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div class="flex justify-between font-bold text-slate-800 pt-1 border-t border-slate-100 text-sm">
                        <span>Total</span>
                        <span class="text-pink-500">R$ ${totais.total.toFixed(2).replace('.', ',')}</span>
                    </div>
                </div>

                <button onclick="router.navigate('endereco')" class="w-full bg-pink-500 text-white font-bold py-2.5 rounded-xl shadow-md text-xs hover:bg-pink-600">
                    Finalizar Pedido
                </button>
            `}
        `;
    },

    endereco() {
        return `
            <div class="flex items-center mb-4">
                <button onclick="router.navigate('carrinho')" class="mr-2 text-slate-600"><i class="fa-solid fa-arrow-left text-xs"></i></button>
                <h2 class="font-bold text-slate-800 text-sm">Entrega</h2>
            </div>
            
            <div class="bg-white p-3 rounded-xl border border-slate-100 mb-4 text-xs relative">
                <span class="text-slate-400 font-medium block mb-1">Endereço de entrega</span>
                <div class="flex items-start space-x-2">
                    <i class="fa-solid fa-location-dot text-slate-400 mt-0.5"></i>
                    <div>
                        <p class="font-semibold text-slate-700">${state.endereco.rua}</p>
                        <p class="text-slate-400 text-[10px]">${state.endereco.bairro} - ${state.endereco.cidade}</p>
                        <p class="text-slate-400 text-[10px]">CEP: ${state.endereco.cep}</p>
                    </div>
                </div>
                <button onclick="router.navigate('form-endereco')" class="absolute top-3 right-3 text-pink-500 font-semibold text-[11px]">Alterar</button>
            </div>

            <h3 class="font-bold text-slate-700 text-xs mb-2">Tipo de entrega</h3>
            <div class="space-y-2 mb-4">
                <label onclick="controller.setTipoEntrega('casa')" class="flex items-center justify-between bg-white p-3 rounded-xl border ${state.endereco.tipoEntrega === 'casa' ? 'border-pink-500 bg-pink-50/10' : 'border-slate-100'} cursor-pointer">
                    <div class="flex items-center space-x-2">
                        <input type="radio" name="tipoEntrega" ${state.endereco.tipoEntrega === 'casa' ? 'checked' : ''} class="accent-pink-500">
                        <div>
                            <p class="text-xs font-semibold text-slate-700">Entrega em casa</p>
                            <p class="text-[10px] text-slate-400">Receba no endereço informado</p>
                        </div>
                    </div>
                    <span class="text-xs font-bold text-slate-700">R$ 7,90</span>
                </label>
                <label onclick="controller.setTipoEntrega('loja')" class="flex items-center justify-between bg-white p-3 rounded-xl border ${state.endereco.tipoEntrega === 'loja' ? 'border-pink-500 bg-pink-50/10' : 'border-slate-100'} cursor-pointer">
                    <div class="flex items-center space-x-2">
                        <input type="radio" name="tipoEntrega" ${state.endereco.tipoEntrega === 'loja' ? 'checked' : ''} class="accent-pink-500">
                        <div>
                            <p class="text-xs font-semibold text-slate-700">Retirar na loja</p>
                            <p class="text-[10px] text-slate-400">Rua dos Cupcakes, 45 - Centro - São Paulo, SP</p>
                        </div>
                    </div>
                    <span class="text-xs font-bold text-slate-700">Grátis</span>
                </label>
            </div>

            <h3 class="font-bold text-slate-700 text-xs mb-2">Data e horário</h3>
            <div class="grid grid-cols-2 gap-2 mb-6">
                <div>
                    <label class="text-[10px] text-slate-400 block mb-1">Data</label>
                    <div class="relative">
                        <input type="text" value="${state.endereco.dataEntrega}" class="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-700 focus:outline-none">
                        <i class="fa-regular fa-calendar absolute right-2.5 top-2.5 text-slate-400 text-xs"></i>
                    </div>
                </div>
                <div>
                    <label class="text-[10px] text-slate-400 block mb-1">Horário</label>
                    <select class="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-700 focus:outline-none">
                        <option>14:00 - 15:00</option>
                        <option>15:00 - 16:00</option>
                        <option>16:00 - 17:00</option>
                    </select>
                </div>
            </div>

            <button onclick="router.navigate('pagamento')" class="w-full bg-pink-500 text-white font-bold py-2.5 rounded-xl shadow-md text-xs hover:bg-pink-600">
                Continuar para Pagamento
            </button>
        `;
    },

    formEndereco() {
        return `
            <div class="flex items-center mb-4">
                <button onclick="router.navigate('endereco')" class="mr-2 text-slate-600"><i class="fa-solid fa-arrow-left text-xs"></i></button>
                <h2 class="font-bold text-slate-800 text-sm">Editar Endereço</h2>
            </div>
            <form onsubmit="controller.salvarEnderecoEContinuar(event)" class="space-y-3 text-xs">
                <div>
                    <label class="block text-slate-500 mb-1">Endereço / Rua</label>
                    <input type="text" id="input-rua" value="${state.endereco.rua}" required class="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-pink-500">
                </div>
                <div>
                    <label class="block text-slate-500 mb-1">Bairro</label>
                    <input type="text" id="input-bairro" value="${state.endereco.bairro}" required class="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-pink-500">
                </div>
                <div>
                    <label class="block text-slate-500 mb-1">Cidade</label>
                    <input type="text" id="input-cidade" value="${state.endereco.cidade}" required class="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-pink-500">
                </div>
                <div>
                    <label class="block text-slate-500 mb-1">CEP</label>
                    <input type="text" id="input-cep" value="${state.endereco.cep}" required class="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-pink-500">
                </div>
                <button type="submit" class="w-full bg-pink-500 text-white font-bold py-2.5 rounded-xl shadow-md text-xs hover:bg-pink-600 mt-4">
                    Salvar Endereço
                </button>
            </form>
        `;
    },

    pagamento() {
        const totais = controller.calcularTotais();
        return `
            <div class="flex items-center mb-4">
                <button onclick="router.navigate('endereco')" class="mr-2 text-slate-600"><i class="fa-solid fa-arrow-left text-xs"></i></button>
                <h2 class="font-bold text-slate-800 text-sm">Pagamento</h2>
            </div>

            <h3 class="font-bold text-slate-700 text-xs mb-2">Resumo do pedido</h3>
            <div class="bg-white p-3 rounded-xl border border-slate-100 mb-4 text-xs space-y-1">
                <div class="flex justify-between text-slate-500"><span>Itens (3)</span><span>R$ ${totais.subtotal.toFixed(2).replace('.', ',')}</span></div>
                <div class="flex justify-between text-slate-500"><span>Taxa de entrega</span><span>R$ ${totais.taxa.toFixed(2).replace('.', ',')}</span></div>
                <div class="flex justify-between font-bold text-slate-800 pt-1 border-t border-slate-100 text-sm"><span>Total</span><span class="text-pink-500">R$ ${totais.total.toFixed(2).replace('.', ',')}</span></div>
            </div>

            <h3 class="font-bold text-slate-700 text-xs mb-2">Forma de pagamento</h3>
            <div class="space-y-2 mb-6">
                <label onclick="controller.setFormaPagamento('pix')" class="flex items-center justify-between bg-white p-3 rounded-xl border ${state.pagamento.metodo === 'pix' ? 'border-pink-500 bg-pink-50/10' : 'border-slate-100'} cursor-pointer">
                    <div class="flex items-center space-x-2">
                        <input type="radio" name="pagamento" ${state.pagamento.metodo === 'pix' ? 'checked' : ''} class="accent-pink-500">
                        <div>
                            <p class="text-xs font-semibold text-slate-700">Pix</p>
                            <p class="text-[10px] text-slate-400">Aprovação imediata</p>
                        </div>
                    </div>
                </label>

                <label onclick="controller.setFormaPagamento('cartao')" class="flex items-center justify-between bg-white p-3 rounded-xl border ${state.pagamento.metodo === 'cartao' ? 'border-pink-500 bg-pink-50/10' : 'border-slate-100'} cursor-pointer">
                    <div class="flex items-center space-x-2">
                        <input type="radio" name="pagamento" ${state.pagamento.metodo === 'cartao' ? 'checked' : ''} class="accent-pink-500">
                        <div>
                            <p class="text-xs font-semibold text-slate-700">Cartão de crédito</p>
                            <p class="text-[10px] text-slate-400">Pague em até 12x</p>
                        </div>
                    </div>
                </label>

                <label onclick="controller.setFormaPagamento('debito')" class="flex items-center justify-between bg-white p-3 rounded-xl border ${state.pagamento.metodo === 'debito' ? 'border-pink-500 bg-pink-50/10' : 'border-slate-100'} cursor-pointer">
                    <div class="flex items-center space-x-2">
                        <input type="radio" name="pagamento" ${state.pagamento.metodo === 'debito' ? 'checked' : ''} class="accent-pink-500">
                        <div>
                            <p class="text-xs font-semibold text-slate-700">Cartão de débito</p>
                            <p class="text-[10px] text-slate-400">Débito online</p>
                        </div>
                    </div>
                </label>

                <label onclick="controller.setFormaPagamento('dinheiro')" class="flex items-center justify-between bg-white p-3 rounded-xl border ${state.pagamento.metodo === 'dinheiro' ? 'border-pink-500 bg-pink-50/10' : 'border-slate-100'} cursor-pointer">
                    <div class="flex items-center space-x-2">
                        <input type="radio" name="pagamento" ${state.pagamento.metodo === 'dinheiro' ? 'checked' : ''} class="accent-pink-500">
                        <div>
                            <p class="text-xs font-semibold text-slate-700">Dinheiro</p>
                            <p class="text-[10px] text-slate-400">Somente na entrega</p>
                        </div>
                    </div>
                </label>
            </div>

            <button onclick="controller.finalizarPedido()" class="w-full bg-pink-500 text-white font-bold py-2.5 rounded-xl shadow-md text-xs hover:bg-pink-600">
                Pagar
            </button>
        `;
    },

    confirmacao() {
        const ped = state.pedidoAtual || state.historicoPedidos[0];
        return `
            <div class="text-center py-4">
                <div class="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl mx-auto mb-2 border border-green-200">
                    <i class="fa-solid fa-check"></i>
                </div>
                <h2 class="font-bold text-slate-800 text-sm mb-1">Pedido realizado com sucesso!</h2>

                <div class="bg-white p-3 rounded-xl border border-slate-100 my-4 text-center">
                    <p class="text-[10px] text-slate-400">Número do pedido</p>
                    <p class="font-bold text-slate-800 text-xs">#${ped.id}</p>
                </div>

                <div class="bg-white p-3 rounded-xl border border-slate-100 text-left text-xs mb-4 space-y-1">
                    <h3 class="font-bold text-slate-700 text-[11px] mb-2">Resumo do pedido</h3>
                    <div class="flex justify-between text-slate-500"><span>3 itens</span><span>R$ ${ped.totais.subtotal.toFixed(2).replace('.', ',')}</span></div>
                    <div class="flex justify-between text-slate-500"><span>Taxa de entrega</span><span>R$ ${ped.totais.taxa.toFixed(2).replace('.', ',')}</span></div>
                    <div class="flex justify-between font-bold text-slate-800 pt-1 border-t border-slate-100"><span>Total pago</span><span class="text-pink-500">R$ ${ped.totais.total.toFixed(2).replace('.', ',')}</span></div>
                </div>

                <p class="text-[10px] text-slate-400 mb-4 px-2">Você receberá atualizações do seu pedido no e-mail e também pelo WhatsApp.</p>

                <button onclick="router.navigate('acompanhar')" class="w-full bg-pink-500 text-white font-bold py-2.5 rounded-xl shadow-md text-xs mb-2">
                    Acompanhar Pedido
                </button>
                <button onclick="router.navigate('catalogo')" class="w-full bg-slate-100 text-slate-600 font-bold py-2.5 rounded-xl text-xs">
                    Continuar Comprando
                </button>
            </div>
        `;
    },

    acompanhar() {
        const ped = state.pedidoAtual || state.historicoPedidos[0];
        return `
            <div class="flex items-center mb-2">
                <button onclick="router.navigate('catalogo')" class="mr-2 text-slate-600"><i class="fa-solid fa-arrow-left text-xs"></i></button>
                <h2 class="font-bold text-slate-800 text-sm">Meu Pedido</h2>
            </div>
            
            <div class="flex justify-between items-center mb-4">
                <div>
                    <h3 class="font-bold text-slate-800 text-xs">Pedido #${ped.id}</h3>
                    <p class="text-[10px] text-slate-400">${ped.data}</p>
                </div>
                <button onclick="router.navigate('detalhes-pedido')" class="bg-amber-100 text-amber-600 font-semibold px-2 py-0.5 rounded text-[10px]">
                    ${ped.status}
                </button>
            </div>

            <h3 class="font-bold text-slate-700 text-xs mb-2">Status do pedido</h3>
            <div class="bg-white p-3 rounded-xl border border-slate-100 space-y-3 mb-4 text-xs">
                <div class="flex items-start space-x-3 text-green-600">
                    <i class="fa-solid fa-circle-check text-sm mt-0.5"></i>
                    <div>
                        <p class="font-bold text-slate-800 text-xs">Pedido recebido</p>
                        <p class="text-[10px] text-slate-400">${ped.dataRecebido}</p>
                    </div>
                </div>
                <div class="flex items-start space-x-3 text-amber-500">
                    <i class="fa-regular fa-clock text-sm mt-0.5"></i>
                    <div>
                        <p class="font-bold text-slate-800 text-xs">Em preparo</p>
                        <p class="text-[10px] text-slate-400">24/05/2024 - 13:30</p>
                    </div>
                </div>
                <div class="flex items-start space-x-3 text-slate-300">
                    <i class="fa-regular fa-circle text-sm mt-0.5"></i>
                    <div>
                        <p class="font-bold text-slate-400 text-xs">Saiu para entrega</p>
                        <p class="text-[10px] text-slate-300">Aguardando</p>
                    </div>
                </div>
                <div class="flex items-start space-x-3 text-slate-300">
                    <i class="fa-regular fa-circle text-sm mt-0.5"></i>
                    <div>
                        <p class="font-bold text-slate-400 text-xs">Entregue</p>
                        <p class="text-[10px] text-slate-300">Aguardando</p>
                    </div>
                </div>
            </div>

            <h3 class="font-bold text-slate-700 text-xs mb-2">Endereço de entrega</h3>
            <div class="bg-white p-3 rounded-xl border border-slate-100 mb-4 text-xs">
                <p class="font-semibold text-slate-700">${ped.endereco.rua}</p>
                <p class="text-slate-400 text-[10px]">${ped.endereco.bairro} - ${ped.endereco.cidade}</p>
                <p class="text-slate-400 text-[10px]">CEP: ${ped.endereco.cep}</p>
            </div>
        `;
    },

    detalhesPedido() {
        const ped = state.pedidoAtual || state.historicoPedidos[0];
        return `
            <div class="flex items-center mb-2">
                <button onclick="router.navigate('acompanhar')" class="mr-2 text-slate-600"><i class="fa-solid fa-arrow-left text-xs"></i></button>
                <h2 class="font-bold text-slate-800 text-sm">Detalhes do Pedido</h2>
            </div>

            <div class="flex justify-between items-center mb-4">
                <div>
                    <h3 class="font-bold text-slate-800 text-xs">Pedido #${ped.id}</h3>
                    <p class="text-[10px] text-slate-400">${ped.dataRecebido}</p>
                </div>
                <span class="bg-amber-100 text-amber-600 font-semibold px-2 py-0.5 rounded text-[10px]">
                    ${ped.status}
                </span>
            </div>

            <h3 class="font-bold text-slate-700 text-xs mb-2">Itens do pedido</h3>
            <div class="bg-white p-3 rounded-xl border border-slate-100 space-y-2 mb-4 text-xs">
                ${ped.itens.map(i => `
                    <div class="flex justify-between text-slate-700">
                        <span>${i.produto.nome} <span class="text-slate-400 text-[10px] ml-2">${i.quantidade}x</span></span>
                        <span class="font-semibold">R$ ${(i.produto.preco * i.quantidade).toFixed(2).replace('.', ',')}</span>
                    </div>
                `).join('')}
            </div>

            <h3 class="font-bold text-slate-700 text-xs mb-2">Resumo</h3>
            <div class="bg-white p-3 rounded-xl border border-slate-100 space-y-1 text-xs mb-4">
                <div class="flex justify-between text-slate-500"><span>Subtotal</span><span>R$ ${ped.totais.subtotal.toFixed(2).replace('.', ',')}</span></div>
                <div class="flex justify-between text-slate-500"><span>Taxa de entrega</span><span>R$ ${ped.totais.taxa.toFixed(2).replace('.', ',')}</span></div>
                <div class="flex justify-between font-bold text-slate-800 pt-1 border-t border-slate-100"><span>Total pago</span><span class="text-pink-500">R$ ${ped.totais.total.toFixed(2).replace('.', ',')}</span></div>
            </div>

            <h3 class="font-bold text-slate-700 text-xs mb-2">Pagamento</h3>
            <div class="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center text-xs mb-4">
                <span class="capitalize text-slate-700">${ped.pagamento}</span>
                <span class="text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded text-[10px]">Pago</span>
            </div>

            <h3 class="font-bold text-slate-700 text-xs mb-2">Entrega</h3>
            <div class="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center text-xs mb-4">
                <span class="text-slate-700">Entrega em casa</span>
                <span class="text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded text-[10px]">Em preparo</span>
            </div>
        `;
    },

    pedidos() {
        return `
            <h2 class="font-bold text-slate-800 text-sm mb-4">Histórico de Pedidos</h2>
            ${state.historicoPedidos.length === 0 ? `<p class="text-xs text-slate-400">Nenhum pedido realizado.</p>` : `
                <div class="space-y-3">
                    ${state.historicoPedidos.map(p => `
                        <div onclick="router.navigate('detalhes-pedido')" class="bg-white p-3 rounded-xl border border-slate-100 text-xs shadow-sm cursor-pointer hover:shadow-md transition">
                            <div class="flex justify-between font-bold mb-1">
                                <span class="text-slate-700">#${p.id}</span>
                                <span class="text-pink-500">R$ ${p.totais.total.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <p class="text-slate-400 text-[10px] mb-2">${p.data}</p>
                            <span class="bg-amber-100 text-amber-600 font-bold px-2 py-0.5 rounded text-[10px]">${p.status}</span>
                        </div>
                    `).join('')}
                </div>
            `}
        `;
    }
};

// Inicializar Renderização
window.onload = () => {
    controller.atualizarBadgeCarrinho();
    router.render();
};