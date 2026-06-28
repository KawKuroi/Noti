// Nucleo de la app Tauri (Fases 30/31): envuelve la web de produccion en un
// webview y agrega la capa nativa — bandeja del sistema, autoarranque y el
// scheduler de notificaciones locales (inyectado como init script, ver
// init/programador.js). En Android el mismo crate compila via mobile_entry_point.
//
// Las preferencias de inicio (autoarranque, iniciar minimizado, cerrar a bandeja)
// son por-maquina y se exponen a la web via comandos IPC; el estado vive en
// config.rs (config.json local) y el autoarranque en el propio SO.

use tauri::Manager;

#[cfg(desktop)]
use std::sync::Mutex;

#[cfg(desktop)]
mod config;

#[cfg(desktop)]
use config::ConfigInicio;

const URL_APP: &str = "https://noti-seven-peach.vercel.app";

// DTO que consume la web (camelCase para el JSON del invoke).
#[cfg(desktop)]
#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct ConfigInicioDto {
    autostart: bool,
    iniciar_minimizado: bool,
    cerrar_a_bandeja: bool,
}

#[cfg(desktop)]
#[tauri::command]
fn obtener_config_inicio(app: tauri::AppHandle) -> ConfigInicioDto {
    use tauri_plugin_autostart::ManagerExt;
    let autostart = app.autolaunch().is_enabled().unwrap_or(false);
    let cfg = app
        .state::<Mutex<ConfigInicio>>()
        .lock()
        .map(|c| c.clone())
        .unwrap_or_default();
    ConfigInicioDto {
        autostart,
        iniciar_minimizado: cfg.iniciar_minimizado,
        cerrar_a_bandeja: cfg.cerrar_a_bandeja,
    }
}

#[cfg(desktop)]
#[tauri::command]
fn set_autostart(app: tauri::AppHandle, activado: bool) -> Result<(), String> {
    use tauri_plugin_autostart::ManagerExt;
    let gestor = app.autolaunch();
    let resultado = if activado {
        gestor.enable()
    } else {
        gestor.disable()
    };
    resultado.map_err(|e| e.to_string())
}

#[cfg(desktop)]
#[tauri::command]
fn set_iniciar_minimizado(app: tauri::AppHandle, activado: bool) -> Result<(), String> {
    actualizar_config(&app, |cfg| cfg.iniciar_minimizado = activado)
}

#[cfg(desktop)]
#[tauri::command]
fn set_cerrar_a_bandeja(app: tauri::AppHandle, activado: bool) -> Result<(), String> {
    actualizar_config(&app, |cfg| cfg.cerrar_a_bandeja = activado)
}

// Aplica un cambio sobre el estado en memoria y lo persiste a disco.
#[cfg(desktop)]
fn actualizar_config(
    app: &tauri::AppHandle,
    aplicar: impl FnOnce(&mut ConfigInicio),
) -> Result<(), String> {
    let estado = app.state::<Mutex<ConfigInicio>>();
    let mut cfg = estado.lock().map_err(|_| "config envenenada".to_string())?;
    aplicar(&mut cfg);
    config::guardar(app, &cfg).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default().plugin(tauri_plugin_notification::init());

    #[cfg(desktop)]
    let builder = builder
        // Segunda instancia: enfocar la ventana existente en lugar de duplicar.
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(ventana) = app.get_webview_window("principal") {
                let _ = ventana.show();
                let _ = ventana.set_focus();
            }
        }))
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .invoke_handler(tauri::generate_handler![
            obtener_config_inicio,
            set_autostart,
            set_iniciar_minimizado,
            set_cerrar_a_bandeja
        ]);

    builder
        .setup(|app| {
            // En escritorio, las preferencias locales deciden la visibilidad inicial.
            #[cfg(desktop)]
            let iniciar_minimizado = {
                use tauri_plugin_autostart::ManagerExt;
                let mut cfg = config::cargar(app.handle());
                if !cfg.inicio_configurado {
                    // Primer arranque: activar autoarranque por defecto (la razon de
                    // ser de la app) y marcar configurado; luego se respeta la eleccion.
                    let _ = app.autolaunch().enable();
                    cfg.inicio_configurado = true;
                    let _ = config::guardar(app.handle(), &cfg);
                }
                let minimizado = cfg.iniciar_minimizado;
                app.manage(Mutex::new(cfg));
                minimizado
            };
            #[cfg(not(desktop))]
            let iniciar_minimizado = false;

            let url: tauri::Url = URL_APP.parse().expect("URL_APP invalida");
            tauri::WebviewWindowBuilder::new(app, "principal", tauri::WebviewUrl::External(url))
                .title("Noti")
                .inner_size(1100.0, 720.0)
                .visible(!iniciar_minimizado)
                .initialization_script(include_str!("../init/programador.js"))
                .build()?;

            #[cfg(desktop)]
            configurar_bandeja(app)?;

            Ok(())
        })
        .on_window_event(|ventana, evento| {
            // Cerrar la ventana: por defecto ocultar a bandeja para que el proceso
            // (y el scheduler del webview) sigan vivos; si el usuario lo desactiva,
            // dejamos cerrar y la app termina.
            #[cfg(desktop)]
            if let tauri::WindowEvent::CloseRequested { api, .. } = evento {
                let cerrar_a_bandeja = ventana
                    .app_handle()
                    .state::<Mutex<ConfigInicio>>()
                    .lock()
                    .map(|cfg| cfg.cerrar_a_bandeja)
                    .unwrap_or(true);
                if cerrar_a_bandeja {
                    api.prevent_close();
                    let _ = ventana.hide();
                }
            }
            #[cfg(not(desktop))]
            {
                let _ = (ventana, evento);
            }
        })
        .run(tauri::generate_context!())
        .expect("error al iniciar Noti");
}

#[cfg(desktop)]
fn configurar_bandeja(app: &tauri::App) -> tauri::Result<()> {
    use tauri::menu::{Menu, MenuItem};
    use tauri::tray::TrayIconBuilder;

    let abrir = MenuItem::with_id(app, "abrir", "Abrir Noti", true, None::<&str>)?;
    let salir = MenuItem::with_id(app, "salir", "Salir", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&abrir, &salir])?;

    TrayIconBuilder::with_id("bandeja")
        .icon(app.default_window_icon().expect("icono por defecto ausente").clone())
        .tooltip("Noti")
        .menu(&menu)
        .show_menu_on_left_click(true)
        .on_menu_event(|app, evento| match evento.id.as_ref() {
            "abrir" => {
                if let Some(ventana) = app.get_webview_window("principal") {
                    let _ = ventana.show();
                    let _ = ventana.set_focus();
                }
            }
            "salir" => app.exit(0),
            _ => {}
        })
        .build(app)?;

    Ok(())
}
