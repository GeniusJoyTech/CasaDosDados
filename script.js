function createJson() {
    var termo = document.getElementById("termo").value.split(',').map(function (item) { return item.trim(); }),
        atividade_principal = document.getElementById("atividade_principal").value.split(',').map(function (item) { return item.trim(); }),
        incluir_atividade_secundaria = document.getElementById("incluir_atividade_secundaria").checked ? true : false,
        natureza_juridica = document.getElementById("natureza_juridica").value.split(',').map(function (item) { return item.trim(); }),
        situacaoElements = document.getElementsByName("situacao_cadastral"),
        situacaoCadastral;
    for (var i = 0; i < situacaoElements.length; i++) {
        if (situacaoElements[i].checked) {
            situacaoCadastral = situacaoElements[i].value;
            break;
        }
    };
    var cep = document.getElementById("cep").value.split(',').map(function (item) { return item.trim(); }),
        uf = document.getElementById("uf").value.split(',').map(function (item) { return item.trim(); }),
        municipio = document.getElementById("municipio").value.split(',').map(function (item) { return item.trim(); }),
        bairro = document.getElementById("bairro").value.split(',').map(function (item) { return item.trim(); }),
        ddd = document.getElementById("ddd").value.split(',').map(function (item) { return item.trim(); }),
        data_abertura_lte = document.getElementById("data_abertura_lte").value,
        data_abertura_gte = document.getElementById("data_abertura_gte").value,
        capital_abertura_lte = document.getElementById("capital_abertura_lte").value,
        capital_abertura_gte = document.getElementById("capital_abertura_lte").value,
        somente_mei = document.getElementById("somente_mei").checked ? true : false,
        excluir_mei = document.getElementById("excluir_mei").checked ? true : false,
        com_contato_telefonico = document.getElementById("com_contato_telefonico").checked ? true : false,
        somente_fixo = document.getElementById("somente_fixo").checked ? true : false,
        somente_matriz = document.getElementById("somente_matriz").checked ? true : false,
        somente_filial = document.getElementById("somente_filial").checked ? true : false,
        com_email = document.getElementById("com_email").checked ? true : false;

    // Array para armazenar todas as respostas.data.cnpj
    var allResponses = [];

    // Função para fazer a requisição para uma página específica
    function fetchPage(page) {
        var send = {
            "query": {
                "termo": termo != '' ? termo : [],
                "atividade_principal": atividade_principal != '' ? atividade_principal : [],
                "natureza_juridica": natureza_juridica != '' ? natureza_juridica : [],
                "uf": uf != '' ? uf : [],
                "municipio": municipio != '' ? municipio : [],
                "bairro": bairro != '' ? bairro : [],
                "situacao_cadastral": situacaoCadastral,
                "cep": cep != '' ? cep : [],
                "ddd": ddd != '' ? ddd : []
            },
            "range_query": {
                "data_abertura": {
                    "lte": data_abertura_lte != '' ? data_abertura_lte : null,
                    "gte": data_abertura_gte != '' ? data_abertura_gte : null
                },
                "capital_social": {
                    "lte": capital_abertura_lte != '' ? capital_abertura_lte : null,
                    "gte": capital_abertura_gte != '' ? capital_abertura_gte : null
                }
            },
            "extras": {
                "somente_mei": somente_mei,
                "excluir_mei": excluir_mei,
                "com_email": com_email,
                "incluir_atividade_secundaria": incluir_atividade_secundaria,
                "com_contato_telefonico": com_contato_telefonico,
                "somente_fixo": somente_fixo,
                "somente_matriz": somente_matriz,
                "somente_filial": somente_filial
            },
            "page": page
        };

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(send),
        };

        return fetch('https://api.casadosdados.com.br/v2/public/cnpj/search', requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log(`Response for page ${page}:`, data.data.cnpj);
                allResponses.push(...data.data.cnpj);  // Adiciona os cnpjs da página ao array
            })
            .catch(error => {
                console.error(`Fetch error for page ${page}:`, error);
            });
    }

    // Função para buscar as páginas sequencialmente
    function fetchPagesSequentially(currentPage) {
        if (currentPage <= 10) {
            fetchPage(currentPage)
                .then(() => {
                    fetchPagesSequentially(currentPage + 1);  // Chama a próxima página
                });
        } else {
            // console.log('All pages fetched:', allResponses);
            // allResponses = formatarAtividadePrincipal(allResponses);
            // console.log(allResponses)
            // exportToCSV(allResponses, "Casadosdados.csv");
        }
    }

    // Inicia a busca da página 1
    fetchPagesSequentially(1);
}

// Função para exportar JSON para CSV com tabulação
function exportToCSV(data, fileName) {
    // Função para converter JSON para CSV com tabulação
    function JSONToTabularCSV(json) {
        const keys = Object.keys(json[0]);
        const header = keys.join('\t') + '\n';

        const rows = json.map(obj => {
            return keys.map(key => {
                // Tratamento especial para valores que são objetos, como atividade_principal
                if (Array.isArray(obj[key])) {
                    return obj[key].map(item => item.text).join(', '); // Extraindo o texto dos objetos
                } else {
                    return obj[key];
                }
            }).join('\t');
        }).join('\n');

        return header + rows;
    }

    // Converter JSON para CSV com tabulação
    const tabularCSVContent = JSONToTabularCSV(data);

    // Criar um arquivo CSV para download
    const blob = new Blob([tabularCSVContent], { type: 'text/csv;charset=utf-8;' });

    // Verificar o navegador e criar o objeto URL para o blob
    const url = window.URL.createObjectURL(blob);

    // Criar um link temporário
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);

    // Adicionar o link ao DOM, clicar nele e remover após o download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function formatarAtividadePrincipal(empresa) {
    if (!empresa || !empresa.atividade_principal || !empresa.atividade_principal.codigo || !empresa.atividade_principal.descricao) {
        return "";  // Retorna uma string vazia se não houver dados válidos
    }

    return `${empresa.atividade_principal.codigo} - ${empresa.atividade_principal.descricao}`;
}