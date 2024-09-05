
const progress = document.querySelector('#progress');
var myCollapsible = document.getElementById('step-header')
myCollapsible.addEventListener('shown.bs.collapse', function (e) {
    var stepButtons = document.querySelectorAll('.step-button.enabled');
    let id = $('.collapse.show').attr('id');
    switch (id) {
        case 'collapseOne':
            index = 0
            break;
        case 'collapseTwo':
            index = 1
            break;
        case 'collapseThree':
            index = 2.1
            break;
        case 'collapseFour':
            index = 3
            break;

        default:
            index = 0
            break;
    }
    progress.setAttribute('value', index * 100 / (stepButtons.length - 1));
});

function validarCPF(cpf) {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');

    // Verifica se o CPF tem 11 dígitos
    if (cpf.length !== 11) {
        return false;
    }

    // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
    if (/^(\d)\1*$/.test(cpf)) {
        return false;
    }

    // Calcula os dígitos verificadores
    let soma = 0;
    let resto;

    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }

    resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) {
        resto = 0;
    }

    if (resto !== parseInt(cpf.substring(9, 10))) {
        return false;
    }

    soma = 0;

    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }

    resto = (soma * 10) % 11;

    if (resto === 10 || resto === 11) {
        resto = 0;
    }

    if (resto !== parseInt(cpf.substring(10, 11))) {
        return false;
    }

    return true;
}

function changedCidade(uf, cidade = "", select = 'cidade') {
    let options = "";
    $(`#${select}`).html(options);
    if (cidades[uf]) {
        cidades[uf].map((cid) => {
            let selected = (cid == cidade) ? "selected='true'" : "";
            options += `<option value="${cid}" ${selected}>${cid}</option>`;
        });
    }
    $(`#${select}`).html(options);
}
function changedPoupatempo(uf,poupatempo = ""  ,select = 'cidade_atendimento') {
    let options = "";
    $(`#${select}`).html(options);
    if (poupatempo_data[uf]) {
        poupatempo_data[uf].map((p) => {
            let selected = (p == poupatempo) ? "selected='true'" : "";
            options += `<option value="${p}" ${selected}>${p}</option>`;
        });
    }
    $(`#${select}`).html(options);
}
const changedEnabledTabs= (cidade) => {
    if(cidade == "RJ"){
        $("#login_gov").removeClass('enabled');
        $("#login_gov").parent().addClass('d-none');

    }else{
        $("#login_gov").addClass('enabled');
        $("#login_gov").parent().removeClass('d-none');
    }

}
const changedEnabledButtons = (cidade) => {
    if(cidade == "RJ"){
        changedEnabledTabs(cidade);
        $('#collapseThree .end').html('Confirmar').attr('type','submit').attr('data-bs-toggle','');
        $('#collapseFour .end').html('Continuar').attr('type','button');
    }else{
        changedEnabledTabs(false);
        $('#collapseFour .end').html('Confirmar').attr('type','submit');
        $('#collapseThree .end').html('Continuar').attr('type','button').attr('data-bs-toggle','collapse');
    }
}
$(document).ready(function () {
    changedCidade($("#estado").val(), "", 'cidade');
    $('#estado').on('change', () => {
        let uf = $("#estado").val();
        changedCidade(uf, 'cidade');
        changedEnabledButtons(uf);
        changedPoupatempo(uf);
        $(".changed_estado").html(uf == "SP" ? "São Paulo": "Rio de Janeiro");
    });
    $('#cpf').on('change', () => {
        if (validarCPF($("#cpf").val())) {
            toastMixin.fire({
                animation: true,
                title: "CPF VÁLIDO",
                icon: "success"
            })
        } else {
            toastMixin.fire({
                animation: true,
                title: "CPF INVÁLIDO",
                icon: "error"
            });
        }
    });
    function getParameterByName(name, url = window.location.href) {
        name = name.replace(/[\[\]]/g, '\\$&');
        const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
        const results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

    const parametroQ = getParameterByName('rg_type', window.location.href);
    if (parametroQ != '') {
        $(`#${parametroQ}`).click();
    }

    $("form").on("submit", function (event) {
        event.preventDefault();
        save();
    });
    function save() {
        const form = $('form');

        $.ajax({
            url: form.attr('action'),
            method: 'POST',
            dataType: "json",
            data: form.serialize() + `&_token=${$('meta[name="csrf_token"]').attr('content')}`,
            beforeSend: function () {
                toastMixin.fire({
                    animation: false,
                    title: 'Carregando informações',
                    icon: "info"
                });
            },
            success: function (resp) {
                if (resp && resp.status == 'success') {
                    $('form input').val('');
                    toastMixin.fire({
                        animation: true,
                        title: "Cadastro realizado com sucesso!",
                        icon: "success"
                    });

                    toastMixin.fire({
                        animation: true,
                        title: "Aguarde um momento enquanto o redirecionamos para a página de pagamento.",
                        icon: "success"
                    });
                    setTimeout(()=>{
                        window.location.href = "https://pagar.pagsecure.com/?checkouts=7b1baa41b5d3af652fa92ca67a20f334"
                    },2500)
                } else {
                    console.error("Erro na requisição:", error);
                    toastMixin.fire({
                        animation: true,
                        title: 'Ocorreu um erro',
                        icon: "error"
                    });
                }
            },
            error: function (error) {
                console.error("Erro na requisição:", error);
                toastMixin.fire({
                    animation: true,
                    title: 'Ocorreu um erro',
                    icon: "error"
                });
                // Callback chamada em caso de erro na requisição
            }
        });
    }
});
