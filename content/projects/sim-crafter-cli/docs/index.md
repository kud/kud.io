---
title: "sim-crafter-cli"
description: "Simplify device simulations: Sim Crafter is a minimal simctl wrapper for quick setup and management."
---

Sim Crafter is a command-line interface tool designed to streamline the management of iOS simulators. With Sim Crafter, users can effortlessly list, create, delete, boot up simulators, and take screenshots directly from the terminal.

## Features

- **List Simulators**: Display all available iOS simulators, including their OS versions, UDIDs, state, and availability.
- **Create Simulators**: Quickly create new simulators by selecting the device type and iOS version.
- **Delete Simulators**: Remove unnecessary simulators with ease.
- **Boot Simulators**: Start up a simulator by choosing from a list of available devices.
- **Take Screenshots**: Capture screenshots from an active simulator.

## Installation

Sim Crafter can be installed through npm. To add it to your project, run the following command:

```bash
npm install -g @kud/sim-crafter-cli
```

Make sure you have Node.js installed on your system to use Sim Crafter.

## Usage

### Listing Available Simulators

To see all available simulators:

```bash
sim-crafter list-remote
```

### Listing Simulators

To see all installed simulators:

```bash
sim-crafter list
```

### Creating a Simulator

To create a new simulator:

```bash
sim-crafter create
```

Follow the prompts to choose a device type and iOS runtime for your new simulator.

### Deleting a Simulator

To delete one or more simulators:

```bash
sim-crafter delete
```

You will be prompted to select the simulators you wish to delete from the presented list.

### Booting a Simulator

To boot up a simulator:

```bash
sim-crafter boot
```

Select a simulator to boot from the list of available devices.

### Taking a Screenshot

To capture a screenshot of a booted simulator:

```bash
sim-crafter screenshot
```

Choose a booted simulator and specify the path where you want the screenshot saved.

## Contributing

Your contributions are welcome! Feel free to submit pull requests or open issues to suggest improvements or add new features to Sim Crafter.

## License

Sim Crafter is distributed under the MIT License. See `LICENSE` for more information.
