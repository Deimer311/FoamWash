import 'package:fpdart/fpdart.dart';
import '../../../../core/errors/failures.dart';
import '../../../../core/network/network_info.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';

class AuthRepositoryImpl implements AuthRepository {
  final NetworkInfo networkInfo;

  AuthRepositoryImpl({
    required this.networkInfo,
  });

  @override
  Future<Either<Failure, User>> login({
    required String email,
    required String password,
  }) async {
    if (await networkInfo.isConnected) {
      try {
        // TODO: Mover la lógica existente de autenticación aquí en el futuro
        // Simulando un inicio de sesión exitoso por ahora
        return const Right(User(id: '1', email: 'test@example.com', name: 'Test User'));
      } catch (e) {
        return Left(ServerFailure(e.toString()));
      }
    } else {
      return const Left(ConnectionFailure());
    }
  }
}
