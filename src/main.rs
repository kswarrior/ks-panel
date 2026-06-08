use std::env;
use std::process::{Command, Stdio};
use std::path::Path;

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() < 2 {
        print_usage();
        return;
    }

    let command = &args[1];

    match command.as_str() {
        "launch" => {
            let mut port = "8080".to_string();
            let mut i = 2;
            while i < args.len() {
                if args[i] == "--port" && i + 1 < args.len() {
                    port = args[i + 1].clone();
                    i += 2;
                } else {
                    i += 1;
                }
            }
            launch_panel(&port);
        }
        "seed" => {
            run_npm_script("seed");
        }
        "create:user" => {
            let extra_args = if args.len() > 2 {
                args[2..].to_vec()
            } else {
                vec![]
            };
            run_create_user(extra_args);
        }
        _ => {
            eprintln!("Unknown command: {}", command);
            print_usage();
        }
    }
}

fn print_usage() {
    println!("Usage: kspanel <command> [options]");
    println!("");
    println!("Commands:");
    println!("  launch [--port <port>]  Starts the KS Panel (default port 8080)");
    println!("  seed                    Runs the database seed script");
    println!("  create:user [args]      Creates a new admin user");
}

fn get_panel_dir() -> &'static Path {
    if Path::new("index.js").exists() && Path::new("package.json").exists() {
        Path::new(".")
    } else {
        Path::new("panel")
    }
}

fn launch_panel(port: &str) {
    println!("Launching KS Panel on port {}...", port);

    let panel_dir = get_panel_dir();

    let status = Command::new("node")
        .arg("index.js")
        .current_dir(panel_dir)
        .env("PORT", port)
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit())
        .spawn()
        .expect("Failed to start KS Panel")
        .wait()
        .expect("Failed to wait for KS Panel");

    if !status.success() {
        eprintln!("KS Panel exited with status: {}", status);
    }
}

fn run_npm_script(script: &str) {
    println!("Running npm run {}...", script);

    let panel_dir = get_panel_dir();

    let status = Command::new("npm")
        .args(["run", script])
        .current_dir(panel_dir)
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit())
        .status()
        .expect("Failed to run npm script");

    if !status.success() {
        eprintln!("npm run {} failed", script);
    }
}

fn run_create_user(args: Vec<String>) {
    println!("Creating user...");

    let panel_dir = get_panel_dir();

    let status = Command::new("node")
        .arg("exec/createUser.js")
        .args(args)
        .current_dir(panel_dir)
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit())
        .stdin(Stdio::inherit())
        .status()
        .expect("Failed to run createUser.js");

    if !status.success() {
        eprintln!("createUser.js failed");
    }
}
