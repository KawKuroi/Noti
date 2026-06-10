// Nucleo de la app Tauri (Fases 30/31): envuelve la web de produccion en un
// webview y agrega la capa nativa — bandeja del sistema, autoarranque y el
// scheduler de notificaciones locales (inyectado como init script, ver
// init/programador.js). En Android el mismo crate compila via mobile_entry_point.

use tauri::Manager;

const URL_APP: &str = "https://noti-seven-peach.vercel.app";

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
        ));

    builder
        .setup(|app| {
            let url: tauri::Url = URL_APP.parse().expect("URL_APP invalida");
            tauri::WebviewWindowBuilder::new(
                app,
                "principal",
                tauri::WebviewUrl::External(url),
            )
            .title("Noti")
            .inner_size(1100.0, 720.0)
            .initialization_script(include_str!("../init/programador.js"))
            .build()?;

            #[cfg(desktop)]
            {
                configurar_bandeja(app)?;
                // Autoarranque activo por defecto: la razon de ser de la app es
                // que las notificaciones lleguen sin abrir nada manualmente.
                use tauri_plugin_autostart::ManagerExt;
                let _ = app.autolaunch().enable();
            }

            Ok(())
        })
        .on_window_event(|ventana, evento| {
            // Cerrar = ocultar a bandeja: el proceso (y el scheduler del
            // webview) siguen vivos para disparar notificaciones.
            #[cfg(desktop)]
            if let tauri::WindowEvent::CloseRequested { api, .. } = evento {
                api.prevent_close();
                let _ = ventana.hide();
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
