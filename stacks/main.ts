import { Api, StackContext } from 'sst/constructs';

export function API({ stack }: StackContext) {
  const api = new Api(stack, 'api', {
    routes: {
      'GET /consumptions': 'packages/functions/src/list.main',
      'GET /consumptions/daily': 'packages/functions/src/get.main',
    },
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
