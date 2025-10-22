import { ApiService } from './api.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServerLocalhostService {
  constructor(
    private apiService: ApiService
  ) { }

  getBalance(api: string, balance: Object): Observable<any> {
    return this.apiService.on(`${api}/balance`, balance, 'post-no-environment');
  }

  printSalePDV(api: string, token: string, body: Object): Observable<any> {
    return this.apiService.on(`${api}/print?token=${token}`, body, 'post-no-environment');
  }

  sendNFe(api: string, body: Object): Observable<any> {
    return this.apiService.on(`${api}/nfe-off`, body, 'post-no-environment');
  }

  getStatusNFe(api: string): Observable<any> {
    return this.apiService.on(`${api}/nfe-off-status`, '', 'get-no-environment');
  }

  tefPayGo(api: string, body: Object): Observable<any> {
    return this.apiService.on(`${api}/tef-paygo`, body, 'post-no-environment');
  }

  tefPayGoStatus(api: string): Observable<any> {
    return this.apiService.on(`${api}/tef-paygo-status`, '', 'get-no-environment');
  }

  generateNFCe(company: any, terminal: any, people: any, products: any, payments: any): any {
    let operation = terminal.natureOperation || company.config.natureOperation;

    let consumidorFinal = 0
    if (people.state_registration_indicator === 9) {
      consumidorFinal = 1
    }

    let nfe: any = {
      status: 0,
      companyId: company.id,
      peopleId: people.id,
      modelo: 65,
      serie: terminal.nfce_serie,
      numero: terminal.nfce_numero,
      nfeNatureOperationId: operation.id,
      natureza_operacao: operation.description,
      data_emissao: new Date(),
      tipo_documento: 1,
      local_destino: company.people.address.state !== people?.address?.state ? 2 : 1,
      finalidade_emissao: operation.finality,
      consumidor_final: consumidorFinal,
      presenca_comprador: 1,

      //Emitente
      cnpj_emitente: company.people.document,
      inscricao_estadual_emitente: company.people.state_registration,
      nome_emitente: company.people.social_name,
      nome_fantasia_emitente: company.people.name,
      inscricao_municipal_emitente: company.people?.municipal_registration || '',
      inscricao_estadual_st_emitente: company.people.state_registration,
      regime_tributario_emitente: company.people.crt,

      //Emitente Endereço
      telefone_emitente: company.people.phone,
      logradouro_emitente: company.people.address.address,
      numero_emitente: company.people.address.number,
      bairro_emitente: company.people.address?.district,
      municipio_emitente: company.people.address.city,
      uf_emitente: company.people.address.state,
      complemento_emitente: company.people?.address?.complement || '',
      codigo_municipio_emitente: Number(company.people.address.code_ibge),
      cep_emitente: company.people.address.zip_code,

      //Destinatario
      cnpj_destinatario: people?.document,
      nome_destinatario: people?.name,
      indicador_inscricao_estadual_destinatario: people?.state_registration_indicator,
      inscricao_estadual_destinatario: people?.municipal_registration || '',

      //Destinatario Endereço
      telefone_destinatario: people?.phone,
      email_destinatario: people?.email,
      logradouro_destinatario: people?.address?.address,
      numero_destinatario: people?.address?.number,
      bairro_destinatario: people?.address?.district,
      municipio_destinatario: people?.address?.city,
      uf_destinatario: people?.address?.state,
      cep_destinatario: people?.address?.zip_code,
      complemento_destinatario: people?.address?.complement,
      codigo_municipio_destinatario: Number(people?.address?.code_ibge),

      modalidade_frete: 9,
      valor_produtos: 0,
      valor_total: 0,

      ibscbs_vbc: 0,

      ibscbs_gibs_vibs: 0,
      ibscbs_gibs_vcred_pres: 0,
      ibscbs_gibs_vcred_cond_sus: 0,

      ibscbs_gibs_gibsuf_vdif: 0,
      ibscbs_gibs_gibsuf_vdev_trib: 0,
      ibscbs_gibs_gibsuf_vibs_uf: 0,

      ibscbs_gibs_gibsmun_vdif: 0,
      ibscbs_gibs_gibsmun_vdev_trib: 0,
      ibscbs_gibs_gibmun_vibs_mun: 0,

      ibscbs_gcbs_vdif: 0,
      ibscbs_gcbs_vdev_trib: 0,
      ibscbs_gcbs_vcbs: 0,
      ibscbs_gcbs_vcred_pres: 0,
      ibscbs_gcbs_vcred_pres_cond_sus: 0,
    }

    let valorTotalOutrasDespesas = 0;
    let valorTotalProdutosBase = 0; // Será o <vProd> no total da nota
    let valorTotalIBS = 0;
    let valorTotalCBS = 0;

    let indexItem = 0
    let nfeItens: any[] = []
    let valorTotal = 0

    // Adiciona Produtos
    for (const product of products) {
      indexItem++
      let findProduct = product.product

      // alíquotas (em porcentagem)
      const pIBS_UF = 0.10;
      const pIBS_MUN = 0;
      const pCBS = 0.90;

      //Calcule o valor final do item (o preço de venda)
      const valorFinalItem = product.amount * product.cost_value;

      //Calcule o valor base do produto, removendo os impostos
      const totalTaxRate = (pIBS_UF + pIBS_MUN + pCBS) / 100;
      const valorBrutoBase = company.people.crt === 3 ? parseFloat((valorFinalItem / (1 + totalTaxRate)).toFixed(2)) : product.cost_value;

      //Calcule os valores de IBS e CBS sobre o novo valor base
      let  vIBS_UF = parseFloat(((valorBrutoBase * pIBS_UF) / 100).toFixed(2));
      let  vIBS_MUN = 0; // Mantido como 0 no seu exemplo
      let  vCBS = parseFloat(((valorBrutoBase * pCBS) / 100).toFixed(2));

      // Some os componentes calculados
      const somaCalculada = valorBrutoBase + vIBS_UF + vIBS_MUN + vCBS;

      //Encontre a diferença para o valor final
      const diferenca = parseFloat((valorFinalItem - somaCalculada).toFixed(2));

      //Se houver diferença, ajuste o maior imposto (vCBS)
      if (diferenca !== 0) {
        vCBS += diferenca;
        vCBS = parseFloat(vCBS.toFixed(2)); // Garante 2 casas decimais após a soma
      }

      let item: any = {
        product_id: findProduct.id,
        numero_item: indexItem.toString(),
        codigo_produto: findProduct.code.toString(),
        codigo_barras_comercial: findProduct.barcode,
        codigo_barras_proprio_comercial: findProduct.barcode,
        codigo_barras_tributavel: findProduct.barcode,
        descricao: product?.description || findProduct.name,
        codigo_ncm: findProduct?.ncm?.code,
        cfop: operation.cfop_state,
        unidade_comercial: findProduct.unit,
        quantidade_comercial: product.amount,

        // ALTERADO: O valor unitário agora é baseado no novo valor base
        valor_unitario_comercial: company.people.crt === 3 ? parseFloat((valorBrutoBase / product.amount).toFixed(10)) : product.cost_value, // Maior precisão aqui

        // ALTERADO: O valor bruto do item é o valor base calculado
        valor_bruto: company.people.crt === 3 ? valorBrutoBase : product.cost_value,

        valor_total_item: company.people.crt === 3 ? valorFinalItem : product.cost_value * product.amount,

        unidade_tributavel: findProduct.unit,
        quantidade_tributavel: product.amount,

        // ALTERADO: O valor unitário tributável também é baseado no novo valor base
        valor_unitario_tributavel: company.people.crt === 3 ? parseFloat((valorBrutoBase / product.amount).toFixed(10)) : product.cost_value,

        icms_origem: findProduct.icms_origin,
        inclui_no_total: 1,

        // ALTERADO: A base de cálculo do ICMS (se houver) também deve ser o valor base
        icms_base_calculo: company.people.crt === 3 ? valorBrutoBase : product.cost_value,

        valor_desconto: 0,
      }

      //Reforma Tributaria
      let ibscbs: any = {
        ibscbs_cst: '000',
        ibscbs_cclass_trib: '000001',

        ibscbs_vbc: valorBrutoBase, // Base de cálculo é o valor do produto sem imposto
        ibscbs_vibs: vIBS_UF + vIBS_MUN, // Valor total do IBS

        ibscbs_pibs_uf: pIBS_UF,
        ibscbs_vibs_uf: vIBS_UF,

        ibscbs_pibs_mun: pIBS_MUN,
        ibscbs_vibs_mun: vIBS_MUN,

        ibscbs_pcbs: pCBS,
        ibscbs_vcbs: vCBS,
      }

      if (consumidorFinal === 0) {
        item = {
          ...item,
          icms_situacao_tributaria:
            findProduct.taxation.rule.nfeTaxationRulesResale.icms_situacao_tributaria,
          icms_percentual_partilha: 0,
          icms_modalidade_base_calculo:
            findProduct.taxation.rule.nfeTaxationRulesResale.icms_modalidade_base_calculo,
          pis_situacao_tributaria:
            findProduct.taxation.rule.nfeTaxationRulesResale.pis_situacao_tributaria,
          pis_base_calculo: 0,
          pis_aliquota_porcentual:
            findProduct.taxation.rule.nfeTaxationRulesResale.pis_aliquota_porcentual,
          pis_valor: 0,
          cofins_situacao_tributaria:
            findProduct.taxation.rule.nfeTaxationRulesResale.cofins_situacao_tributaria,
          cofins_base_calculo: 0,
          cofins_aliquota_porcentual:
            findProduct.taxation.rule.nfeTaxationRulesResale.cofins_aliquota_porcentual,
          cofins_valor: 0,
          ...ibscbs
        }
      } else {
        item = {
          ...item,
          icms_situacao_tributaria:
            findProduct?.taxation?.rule?.nfeTaxationRulesFinalConsumer?.icms_situacao_tributaria,
          icms_percentual_partilha: 0,
          icms_modalidade_base_calculo:
            findProduct?.taxation?.rule?.nfeTaxationRulesFinalConsumer
              ?.icms_modalidade_base_calculo,
          pis_situacao_tributaria:
            findProduct?.taxation?.rule.nfeTaxationRulesFinalConsumer?.pis_situacao_tributaria,
          pis_base_calculo: 0,
          pis_aliquota_porcentual:
            findProduct?.taxation?.rule?.nfeTaxationRulesFinalConsumer?.pis_aliquota_porcentual,
          pis_valor: 0,
          cofins_situacao_tributaria:
            findProduct?.taxation?.rule.nfeTaxationRulesFinalConsumer?.cofins_situacao_tributaria,
          cofins_base_calculo: 0,
          cofins_aliquota_porcentual:
            findProduct?.taxation?.rule.nfeTaxationRulesFinalConsumer?.cofins_aliquota_porcentual,
          cofins_valor: 0,
          ...ibscbs
        }
      }

      // ALTERADO: Atualize os novos totais e o valor final
      valorTotal += valorFinalItem; // Soma o valor que o cliente realmente paga
      valorTotalProdutosBase += valorBrutoBase;
      valorTotalIBS += ibscbs.ibscbs_vibs;
      valorTotalCBS += ibscbs.ibscbs_vcbs;
      valorTotalOutrasDespesas += ibscbs.ibscbs_vibs + ibscbs.ibscbs_vcbs;

      nfeItens.push(item)
    }

    // Some o total dos novos impostos
    const totalNovosImpostos = valorTotalIBS + valorTotalCBS;

    // ALTERADO: Atribua os valores corretos aos totais da NFe
    nfe.valor_produtos = parseFloat(valorTotalProdutosBase.toFixed(2));

    // **A JOGADA É AQUI:**
    // Coloque a soma dos novos impostos em "outras despesas"
    nfe.valor_outras_despesas = company.people.crt === 3 ? parseFloat(totalNovosImpostos.toFixed(2)) : 0;

    // O valor total da nota DEVE ser a soma do valor base dos produtos + impostos.
    // Usar o valorTotal (soma dos pagamentos) é a forma mais segura para evitar erros de arredondamento.
    nfe.valor_total = parseFloat((valorTotalProdutosBase + valorTotalIBS + valorTotalCBS).toFixed(2));

    let nfePagamentos: any[] = []

    for (const payment of payments) {
      let formPayment = ''
      switch (payment.form_payment) {
        case 9:
          formPayment = '01';
          break;
        case 2:
          formPayment = '04';
          break;
        case 1:
          formPayment = '03';
          break;
        case 10:
          formPayment = '17';
          break;
      }

      let paymentMethod = {
        indicador_pagamento: 0,
        forma_pagamento: formPayment,
        valor_pagamento: payment.amount,
        autentication: ''
      }

      nfePagamentos.push(paymentMethod)
    }

    // --- 1. Faça a somatória dos valores ---
    // (Removida a linha duplicada para 'ibscbs_gibs_vibs')
    nfe.ibscbs_vbc = nfeItens
    .reduce((acc: number, product: any) => acc + (Number(product.ibscbs_vbc) || 0), 0);
    nfe.ibscbs_gibs_vibs = nfeItens
    .reduce((acc: number, product: any) => acc + (Number(product.ibscbs_vibs) || 0), 0);
    nfe.ibscbs_gibs_gibsuf_vibs_uf = nfeItens
    .reduce((acc: number, product: any) => acc + (Number(product.ibscbs_vibs_uf) || 0), 0);
    nfe.ibscbs_gibs_gibmun_vibs_mun = nfeItens
    .reduce((acc: number, product: any) => acc + (Number(product.ibscbs_vibs_mun) || 0), 0);
    nfe.ibscbs_gcbs_vcbs = nfeItens
    .reduce((acc: number, product: any) => acc + (Number(product.ibscbs_vcbs) || 0), 0);

    // --- 2. Arredonde os totais para 2 casas decimais ---
    // Usando .toFixed(2) que é mais seguro para moeda.
    // O '+' na frente converte o resultado (que é uma string) de volta para número.
    nfe.ibscbs_vbc = +nfe.ibscbs_vbc.toFixed(2);
    nfe.ibscbs_gibs_vibs = +nfe.ibscbs_gibs_vibs.toFixed(2);
    nfe.ibscbs_gibs_gibsuf_vibs_uf = +nfe.ibscbs_gibs_gibsuf_vibs_uf.toFixed(2);
    nfe.ibscbs_gibs_gibmun_vibs_mun = +nfe.ibscbs_gibs_gibmun_vibs_mun.toFixed(2);
    nfe.ibscbs_gcbs_vcbs = +nfe.ibscbs_gcbs_vcbs.toFixed(2);

    nfe = {
      ...nfe,
      itens: nfeItens,
      pagamentos: nfePagamentos,
    }

    console.log(nfe);
    return nfe
  }
}
