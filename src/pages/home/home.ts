import { Component, ChangeDetectorRef } from '@angular/core';
import { Http, Headers, RequestOptions} from '@angular/http';

import { LoadingController, Loading } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';

import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  imagem: string;
  loading: Loading;
  resultados: object[];


  constructor(
    private change: ChangeDetectorRef,
    private loadingCtrl: LoadingController,
    private camera: Camera, 
    private http: Http 
    ) {}

  tirarFoto() {
    this.loading = this.loadingCtrl.create({
      content: 'Aguarde...'
    });
    this.loading.present();

    const options: CameraOptions = {
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options)
    .then(imagemDados => {
      this.imagem = 'data:image/jpeg;base64,' + imagemDados;
      return imagemDados;
    })
    .then(imagem => {
      return this.requisicaoParaAPI(imagem);
    })
    .then(resultado => {
      this.resultados = resultado.labelAnnotations;
      this.loading.dismiss();
      this.change.detectChanges();
    })
    .catch(() => {
      this.loading.dismiss();
    })

  }

  requisicaoParaAPI(imagemBase64) {
    const apiKey = '';
    const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
    const request = {
      "requests":[
        {
          "image":{
            "content": imagemBase64
          },
          "features":[
            {
              "type":"LABEL_DETECTION",
              "maxResults": 5
            }
          ]
        }
      ]
    }
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const options = new RequestOptions({ headers: headers});

    return this.http.post(url, request, options)
      .toPromise()
      .then(res => res.json().responses[0])
  }

  verificarPrecisao(valor) {
    return Math.round(valor * 100);
  }
}
