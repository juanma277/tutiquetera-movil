import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URL_SERVICIOS } from '../../config/server.config';
import { Platform } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../../pages/login/login';

declare var swal: any;

@Injectable()
export class UsuarioProvider {

  usuario:Usuario = {};

  constructor(public http: HttpClient,
              public platform: Platform,
              public storage: Storage
            ) {}

  crearUsuario(usuario: Usuario){
    let url = URL_SERVICIOS + 'users/create';
    return this.http.post(url, {'nombres': usuario.nombre, 'email':usuario.email, 'password': usuario.password, 'uid':usuario.uid, 'provider':usuario.provider, 'notificaciones':usuario.notificaciones, 'terminos':usuario.terminos})
                .map((resp:any)=>{
                  return resp;
                });    
  }

  loginNormal(email:string, password:string){
    let url = URL_SERVICIOS + 'login/log';
    return this.http.post(url,{'email': email, 'password':password}).map((resp:any)=>{
      if(resp.error){
        swal("Error", "Datos Incorrectos!", "warning");
        return false;
      }else{
        this.cargarUsuario(resp.usuario.nombre, resp.usuario.email, resp.usuario.imagen, resp.usuario.uid, resp.usuario.provider, resp.usuario.role, resp.usuario.estado, resp.usuario.id, resp.procesos);
        this.guardarStorage();
        return true;
      }
    }, error =>{
        swal("Error", "Ha ocurrido un error, por favor intentalo nuevamente!", "warning");
        return false;
    });
  }

  cargarUsuario(nombre:string, email:string, imagen:string, uid:string, provider:string, role:string, estado:string, id:string, procesos:number){
    this.usuario.nombre  = nombre;
    this.usuario.email  = email;
    this.usuario.imagen  = imagen;
    this.usuario.uid  = uid;
    this.usuario.provider  = provider;
    this.usuario.role = role;
    this.usuario.estado = estado;
    this.usuario.id = id;
    this.usuario.procesos = procesos;
  }


  guardarStorage(){
    if(this.platform.is('cordova')){
      //DISPOSITIVO MOVIL
      this.storage.ready().then(()=>{
        this.storage.set('usuario', this.usuario);
      });
    }else{
      //COMPUTADOR
      localStorage.setItem('usuario', JSON.stringify(this.usuario));
    }
  }

  cargarStorage(){
    return new Promise((resolve, reject)=>{
      if(this.platform.is('cordova')){
        //DISPOSITIVO MOVIL
        this.storage.ready().then(()=>{
          this.storage.get('usuario').then(usuario=>{
            if(usuario){
              this.usuario = usuario;
            }
            resolve();
          });
        });
      }else{
        //COMPUTADOR
        if(localStorage.getItem('usuario')){
          this.usuario = JSON.parse(localStorage.getItem('usuario'));          
        }
        resolve();
      }
    });
  }

  eliminarStorage(){
    this.usuario = {};

    if(this.platform.is('cordova')){
      //DISPOSITIVO MOVIL
      this.storage.remove('usuario');
    }else{
      localStorage.removeItem('usuario');
    }

  }

  olvidoPassword(email:string){
    let url = URL_SERVICIOS + 'mails/rememberPassword';
    return this.http.post(url, {'email':email});    
  }

  //FIN CLASE
}

export interface Usuario{
  nombre?:string, 
  email?:string, 
  password?:string, 
  imagen?:string, 
  uid?:string, 
  provider?:string,
  role?:string,
  estado?:string,
  notificaciones?:boolean,
  terminos?:boolean,
  remember?:string,
  id?:string,
  procesos?:number
}