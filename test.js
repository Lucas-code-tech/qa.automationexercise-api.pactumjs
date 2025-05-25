const { spec } = require('pactum');
const { eachLike, like } = require('pactum-matchers');

describe('API Automation Exercise - Testes Realistas com PactumJS', () => {

  it('API 1: Get All Products List', async () => {
    await spec()
      .get('https://automationexercise.com/api/productsList')
      .expectStatus(200)
  });

  it('API 2: POST To All Products List', async () => {
    await spec()
      .post('https://automationexercise.com/api/productsList')
      .expectStatus(200) // aceita que o servidor responda com 200 incorretamente
      .expectJsonLike({
        message: 'This request method is not supported.'
      });
  });


  it('API 3: Get All Brands List', async () => {
    await spec()
      .get('https://automationexercise.com/api/brandsList')
      .expectStatus(200)
      .expectJsonLike({
        responseCode: 200,
        brands: [{}] // Ele deve esperar pelo menos um array com um objeto
      });
  });

  it('API 4: PUT To All Brands List', async () => {
    await spec()
      .put('https://automationexercise.com/api/brandsList')
      .expectStatus(200)
      .expectJsonLike({
        message: 'This request method is not supported.'
      });
  });

  it('API 5: POST To Search Product', async () => {
    await spec()
      .post('https://automationexercise.com/api/searchProduct')
      .withJson({ search_product: 'top' })
      .expectStatus(200)
      .expectJsonLike({});
  });

  it('API 6: POST To Search Product without search_product parameter', async () => {
    await spec()
      .post('https://automationexercise.com/api/searchProduct')
      .expectStatus(200)
      .expectJsonLike({
        responseCode: 400, // erro sinalizado no corpo
        message: 'Bad request, search_product parameter is missing in POST request.'
      });
  });

  it('API 7: POST To Verify Login with valid details', async () => {
    await spec()
      .post('https://automationexercise.com/api/verifyLogin')
      .withHeaders('Content-Type', 'application/json')
      .withJson({ email: 'TesteQALucasCorreto@gmail.com', password: 'Mudar@123' }) //Estourando acredito pois o usuário não estava registrado na base, uma solução era adicionar ele no contexto aonde eu crio usuários, no teste 11.
      .expectStatus(200)
      .expectJsonLike({
        message: 'User exists!'
      });
  });

  it('API 8: POST To Verify Login without email parameter', async () => {
    await spec()
      .post('https://automationexercise.com/api/verifyLogin')
      .withJson({ password: '1234' })
      .expectStatus(200)
      .expectJsonLike({
        responseCode: 400, // erro sinalizado no corpo
        message: 'Bad request, email or password parameter is missing in POST request.'
      });
  });

  it('API 9: DELETE To Verify Login', async () => {
    await spec()
      .delete('https://automationexercise.com/api/verifyLogin')
      .expectStatus(200)
      .expectJsonLike({
        message: 'This request method is not supported.'
      });
  });

  it('API 10: POST To Verify Login with invalid details', async () => {
    await spec()
      .post('https://automationexercise.com/api/verifyLogin')
      .withHeaders('Content-Type', 'application/x-www-form-urlencoded')
      .withBody('email=invalid@example.com&password=wrongpass')
      .expectStatus(200)
      .expectJsonLike({
        responseCode: 404,
        message: 'User not found!'
      });
  });
  const email = `LucasAutomacao_${Date.now()}@mail.com`;
  const password = 'Mudar@123';

  it('API 11: POST To Create/Register User Account', async () => { //Não é interessante ficar nessa estrutura de specs dentro de apenas um IT, adotei somente nesse cenário dessa APIa de testes, pois dai garante que o usuário esteja na base da API.
    // Criar/registrar o usuário
    await spec()
      .post('https://automationexercise.com/api/createAccount')
      .withHeaders('Content-Type', 'application/x-www-form-urlencoded')
      .withBody(
        `name=Lucas QA&email=${email}&password=${password}` +
        `&title=Mr&birth_date=01&birth_month=January&birth_year=1999` +
        `&firstname=Lucas&lastname=Souza&company=Test Company` +
        `&address1=Rua casa grande&address2=ultima casa&country=Brasil` +
        `&zipcode=12324534564&state=State&city=City&mobile_number=8974567890`
      )
      .expectStatus(200)
      .expectJsonLike({
        message: 'User created!'
      });

    //API 14: GET user account detail by email
    await spec() 
      .get('https://automationexercise.com/api/getUserDetailByEmail')  //Utilizei da mesma ideia que eu mencionei no exercicio 12 a baixo.
      .withQueryParams('email', email)
      .expectStatus(200)
      .expectJsonMatch({
        responseCode: 200,
        user: {
          id: like(12345),
          name: 'Lucas QA',
          email: like('email@domain.com'),
          title: 'Mr',
          birth_day: '01',
          birth_month: 'January',
          birth_year: '1999',
          first_name: 'Lucas',
          last_name: 'Souza',
          company: 'Test Company',
          address1: 'Rua casa grande',
          address2: 'ultima casa',
          country: 'Brasil',
          state: 'State',
          city: 'City',
          zipcode: '12324534564'
        }
      });

    await spec() //Teste para validar se o usuário foi criado
      .post('https://automationexercise.com/api/verifyLogin')
      .withHeaders('Content-Type', 'application/x-www-form-urlencoded')
      .withBody(`email=${email}&password=${password}`)
      .expectStatus(200)
      .expectJsonLike({
        message: 'User exists!'
      });

    //API 13: PUT METHOD To Update User Account   -> Utilizei o mesmo conceito a baixo.  
    await spec()
      .put('https://automationexercise.com/api/updateAccount')
      .withHeaders('Content-Type', 'application/x-www-form-urlencoded')
      .withBody(
        `name=Updated User&email=${email}&password=${password}` +
        `&title=Mr&birth_date=01&birth_month=January&birth_year=1990` +
        `&firstname=Updated&lastname=User&company=Company` +
        `&address1=Address 1&address2=Address 2&country=India` +
        `&zipcode=123456&state=State&city=City&mobile_number=1234567890`
      )
      .expectStatus(200)
      .expectJsonLike({
        message: 'User updated!'
      });

    await spec() // API 12: DELETE METHOD To Delete User Account  -> Adicionei ele dentro desse It, pois acredito que a API não está mantendo o dado na base (Por se tratar de uma Api para testes),
      .delete('https://automationexercise.com/api/deleteAccount') //Então em teoria, se não muda o contexto(refresh), ele ainda deverá existir, mesmo que em memoria local ou cash.
      .withHeaders('Content-Type', 'application/x-www-form-urlencoded')
      .withBody(`email=${email}&password=${password}`)
      .expectStatus(200)
      .expectJsonLike({
        message: 'Account deleted!'
      });


  });


});
