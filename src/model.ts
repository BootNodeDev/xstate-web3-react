import { assign, interpret, createMachine } from "xstate";

export interface Context {
  provider: any;
}

export const xstateWeb3 =
  /** @xstate-layout N4IgpgJg5mDOIC5QHcwCMDMB1AhgGzzABcBhAewDsKwBjIgS0oDoAhAJzOVjDYEkL6RAMSJQABzKxBjCqJAAPRAFoArAEYA7Ew0YATAA4M+gGz79GlfpUAaEAE9lxlQAYmagwBY1ATg-ONxt4YAL7BtqiYuATE5FS0DMyx1HT0FFBCAAoASgDyAGq8ACIAollyElIJskgKyj7GTN66geYqxhiBGmoetg4IqhhuzhiaHroWGt7Guiqh4ejY+ISklMlVTEnxqemluWU1FdKUcor93ipuzZa6GCoaXsNqvcq6-kNOTc76Hsbt+rpzEARRbRFZxFLMDIcABu9AgPE2dEgTBwYjEiIYaREB0kR2qoFOSjUIyYzmM3TaBlMHRMzwQt302mczl0U2G318GA8gOBUWWGJkTChZFh8LYGMgQkKvAAyiQcgA5BXFEgAFXKuKqJ0QHgwg2mTj83W+ul0dN0HiY5k03i6KhG5y8xh5Cz5MVWW0hMLhCI9SIgQkobtIAAscGkwBrKjJtQg1GpXBZujMLBaul86USyUwnAEDCyLLcui7Ikt3eD1rhpGkAGJkcV+qpCeVKlXqnHR441QndVy+GavDxdW5NDSZ26Db4tLpO-whQEUMjw+A1XllsFrQXsTjcPgCIhRvGxpTUxreb5c3UslQqHr2ZT2xnuQwqKbeNRtCwlkH8xuCgVpIeWrdsofiMuezIflMzRdN4mYWmobgeE07j2s4bRTPo37BgKXoij6DYVsiqLon+gEdkeIH9KyFw3m09rqNerJjveCDNJaNH6P4t5jFxWFhECrrrrhFBCt6YoShAKJogqZAbvEkBATGVEWro2gaM4PyproCavPodIuE+vhWG0ty-BpGjYcJf54aKvpEVJJGSUpXYEogNyMre54aeYZjGBotKsWMWguMYHj2l4VgeNyAlrqCIlifhEmNopFHAW5-QOkwdFOLcukqMxdI+IhnEeOYQS2kYsyxUJ8U2aJVaYlAdaEZurkgIc6W1PSJKBLqPxvhgvj2pmureNlGAaZ4l6mL4Vl1RWgqpLARBLMGLn4t1J5aGmhgJnqlgYMMmZ-EwXLOJorymBoN2WTVpYLW1m2dcpGVKBZZ4XtFR0zLemYaDclwmiMFpTGo-GhEAA */
  createMachine(
    {
      context: { provider: null } as Context,
      id: "web3WalletConnection",
      initial: "BrowserInit",
      states: {
        BrowserInit: {
          always: [
            {
              cond: "noWeb3Detected",
              target: "#web3WalletConnection.installWallet",
            },
            {
              cond: "storedConnection",
              target: "#web3WalletConnection.Connecting",
            },
            {
              target: "#web3WalletConnection.WaitingForConnection",
            },
          ],
        },
        Connecting: {
          on: {
            PROVIDER: {
              actions: ["addProviderToContext"],
              target: "#web3WalletConnection.ProviderConnected",
            },
            ERROR: {
              target: "#web3WalletConnection.WaitingForConnection",
            },
          },
        },
        ProviderConnected: {
          initial: "appConnecting",
          states: {
            appConnecting: {
              always: [
                {
                  cond: "checkAccount",
                  target: "#web3WalletConnection.ProviderConnected.appConnected",
                },
                {
                  target: "#web3WalletConnection.ProviderConnected.appNotConnected",
                },
              ],
            },
            appNotConnected: {},
            appConnected: {},
          },
          on: {
            DISCONNECT: {
              target: "#web3WalletConnection.WaitingForConnection",
            },
            onWalletChange: {
              target: "#web3WalletConnection.ProviderConnected",
            },
          },
        },
        WaitingForConnection: {
          on: {
            CONNECT: {
              target: "#web3WalletConnection.Connecting",
            },
          },
        },
        installWallet: {
          type: "final",
        },
      },
    },
    {
      actions: {
        addProviderToContext: assign({
          provider: (context, event: any) => event.provider,
        }),
      },
      guards: {
        noWeb3Detected: (context, event) => {
          return false;
          // check web3 exists
        },
        storedConnection: (context, event) => {
          return false;
          // check if there is a stored connection
        },
        checkAccount: (context, event) => {
          return true;
        },
      },
    }
  );

const machine = interpret(xstateWeb3)
  .onTransition((state) => console.log(state.value))
  .start();

machine.send("CONNECT");

machine.send("PROVIDER", { provider: { library: "() => lib" } });

console.log(machine.state.context);
