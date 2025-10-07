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

  generateNFCe(company: any, operation: any, people: any, products: any, payments: any): any {

    let consumidorFinal = 0
    if (people.state_registration_indicator === 9) {
      consumidorFinal = 1
    }

    let nfe: any = {
      status: 0,
      companyId: company.id,
      peopleId: people.id,
      modelo: 65,
      nfeNatureOperationId: operation.id,
      natureza_operacao: operation.description,
      data_emissao: new Date(),
      tipo_documento: 1,
      local_destino: company.people.address.state !== people.address.state ? 2 : 1,
      finalidade_emissao: operation.finality,
      consumidor_final: consumidorFinal,
      presenca_comprador: 1,

      //Emitente
      cnpj_emitente: company.people.document,
      inscricao_estadual_emitente: company.people.state_registration,
      nome_emitente: company.people.social_name,
      nome_fantasia_emitente: company.people.name,
      inscricao_municipal_emitente: company.people.municipal_registration,
      inscricao_estadual_st_emitente: company.people.state_registration,
      regime_tributario_emitente: company.people.state_registration_indicator,

      //Emitente Endereço
      telefone_emitente: company.people.phone,
      logradouro_emitente: company.people.address.address,
      numero_emitente: company.people.address.number,
      bairro_emitente: company.people.address.district,
      municipio_emitente: company.people.address.city,
      uf_emitente: company.people.address.state,
      complemento_emitente: company.people.address.complement,
      codigo_municipio_emitente: Number(company.people.address.code_ibge),
      cep_emitente: company.people.address.zip_code,

      //Destinatario
      cnpj_destinatario: people.document,
      nome_destinatario: people.name,
      indicador_inscricao_estadual_destinatario: people.state_registration_indicator,
      inscricao_estadual_destinatario: people.municipal_registration || '',

      //Destinatario Endereço
      telefone_destinatario: people.phone,
      email_destinatario: people.email,
      logradouro_destinatario: people.address.address,
      numero_destinatario: people.address.number,
      bairro_destinatario: people.address.district,
      municipio_destinatario: people.address.city,
      uf_destinatario: people.address.state,
      cep_destinatario: people.address.zip_code,
      complemento_destinatario: people.address.complement,
      codigo_municipio_destinatario: Number(people.address.code_ibge),

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

    let indexItem = 0
    let nfeItens: any[] = []
    let valorTotal = 0

    // Adiciona Produtos
    for (const product of products) {
      indexItem++
      let findProduct = product.product

      console.log(findProduct);

      let item: any = {
        product_id: findProduct.id,
        numero_item: indexItem.toString(),
        codigo_produto: findProduct.code.toString(),
        codigo_barras_comercial: findProduct.barcode,
        codigo_barras_proprio_comercial: findProduct.barcode,
        codigo_barras_tributavel: findProduct.barcode,
        descricao: product?.description || findProduct.name,
        codigo_ncm: findProduct?.ncm?.code,
        cfop:
          company.people.address.state !== people.address.state
            ? operation.cfop_interstate
            : operation.cfop_state,
        unidade_comercial: findProduct.unit,
        quantidade_comercial: product.amount,
        valor_unitario_comercial: product.cost_value,
        valor_bruto: product.amount * product.cost_value,
        unidade_tributavel: findProduct.unit,
        quantidade_tributavel: product.amount,
        valor_unitario_tributavel: product.cost_value,
        icms_origem: findProduct.icms_origin,
        inclui_no_total: 1,
        icms_base_calculo: product.cost_value,
      }

      //Reforma Tributaria
      let ibscbs: any = {
        ibscbs_cst: findProduct.taxation.rule.nfeTaxationRulesResale.icms_situacao_tributaria + '0',
        ibscbs_cclass_trib: '000001',

        ibscbs_vbc: item.valor_bruto,
        ibscbs_vibs: 0,

        ibscbs_pibs_uf: 0.10,
        ibscbs_vibs_uf: (item.valor_bruto * 0.10) / 100,

        ibscbs_pibs_mun: 0,
        ibscbs_vibs_mun: (item.valor_bruto * 0) / 100,

        ibscbs_pcbs: 0.90,
        ibscbs_vcbs: (item.valor_bruto * 0.90) / 100,
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

      valorTotal += product.amount * product.cost_value
      nfeItens.push(item)
    }

    nfe.valor_produtos = valorTotal
    nfe.valor_total = valorTotal

    let nfePagamentos: any[] = []

    console.log(payments);

    for (const payment of payments) {
      let paymentMethod = {
        indicador_pagamento: 0,
        forma_pagamento: payment.form_payment,
        valor_pagamento: payment.amount,
      }

      nfePagamentos.push(paymentMethod)
    }

    //Somar o bcibscb dos itens
    nfe.ibscbs_vbc = nfeItens
    .reduce((acc: number, product: any) => acc + (Number(product.ibscbs_vbc) || 0), 0);
    nfe.ibscbs_gibs_vibs = nfeItens
    .reduce((acc: number, product: any) => acc + (Number(product.ibscbs_vibs) || 0), 0);
    nfe.ibscbs_gibs_gibsuf_vibs_uf = nfeItens
    .reduce((acc: number, product: any) => acc + (Number(product.ibscbs_vibs_uf) || 0), 0);
    nfe.ibscbs_gibs_gibmun_vibs_mun = nfeItens
    .reduce((acc: number, product: any) => acc + (Number(product.ibscbs_vibs_mun) || 0), 0);

    nfe.ibscbs_gibs_vibs = nfeItens
    .reduce((acc: number, product: any) => acc + (Number(product.ibscbs_vibs) || 0), 0);

    nfe.ibscbs_gcbs_vcbs = nfeItens
    .reduce((acc: number, product: any) => acc + (Number(product.ibscbs_vcbs) || 0), 0);

    nfe = {
      ...nfe,
      itens: nfeItens,
      pagamentos: nfePagamentos,
    }

    return nfe
  }
}
